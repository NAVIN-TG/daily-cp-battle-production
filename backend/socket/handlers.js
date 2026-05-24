const { v4: uuidv4 } = require('uuid');
const Match = require('../models/Match');
const User = require('../models/User');
const { getRandomProblem, checkSolved } = require('../utils/codeforces');
const { calculateRatingChange } = require('../utils/rating');

// In-memory queues & timers
const waitingQueue = []; // { socketId, userId, username, rating, codeforcesHandle, difficulty }
const activePollers = new Map(); // roomId -> intervalId
const matchTimers = new Map(); // roomId -> timeoutId

const MATCH_DURATION_MS = 30 * 60 * 1000; // 30 min
const POLL_INTERVAL_MS = 15 * 1000; // 15 sec

exports.initSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ── AUTH ──────────────────────────────────────────────────────────────
    socket.on('authenticate', async ({ userId }) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { isOnline: true, socketId: socket.id, lastSeen: new Date() },
          { new: true }
        );
        if (user) {
          socket.userId = userId;
          socket.username = user.username;
          socket.codeforcesHandle = user.codeforcesHandle;
          socket.userRating = user.rating;
          socket.emit('authenticated', { success: true });
          console.log(`[Socket] Authenticated: ${user.username}`);
        }
      } catch (err) {
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    // ── MATCHMAKING ───────────────────────────────────────────────────────
    socket.on('find_match', async ({ difficulty = 'any' } = {}) => {
      if (!socket.userId) return socket.emit('error', { message: 'Not authenticated' });

      // Remove any existing queue entry for this user
      const existingIdx = waitingQueue.findIndex((q) => q.userId === socket.userId);
      if (existingIdx !== -1) waitingQueue.splice(existingIdx, 1);

      const existingMatch = waitingQueue.find((q) => q.difficulty === difficulty);
      if (existingMatch) {
        waitingQueue.splice(waitingQueue.indexOf(existingMatch), 1);
        await startMatch(io, socket, existingMatch, difficulty);
      } else {
        waitingQueue.push({
          socketId: socket.id,
          userId: socket.userId,
          username: socket.username,
          codeforcesHandle: socket.codeforcesHandle,
          rating: socket.userRating || 1000,
          difficulty,
          socket,
        });
        socket.emit('queue_joined', { position: waitingQueue.length, difficulty });
        console.log(`[Queue] ${socket.username} joined queue (${difficulty}). Queue size: ${waitingQueue.length}`);
      }
    });

    socket.on('cancel_matchmaking', () => {
      const idx = waitingQueue.findIndex((q) => q.userId === socket.userId);
      if (idx !== -1) {
        waitingQueue.splice(idx, 1);
        socket.emit('queue_left');
      }
    });

    // ── INVITE SYSTEM ─────────────────────────────────────────────────────
    socket.on('create_invite', async ({ difficulty = 'any' } = {}) => {
      if (!socket.userId) return socket.emit('error', { message: 'Not authenticated' });

      const inviteCode = uuidv4().slice(0, 8).toUpperCase();
      const match = await Match.create({
        roomId: uuidv4(),
        inviteCode,
        isPrivate: true,
        matchType: 'invite',
        difficulty,
        status: 'waiting',
        player1: {
          userId: socket.userId,
          username: socket.username,
          codeforcesHandle: socket.codeforcesHandle,
          socketId: socket.id,
        },
      });
      socket.join(match.roomId);
      socket.currentRoom = match.roomId;
      socket.emit('invite_created', { inviteCode, roomId: match.roomId });
    });

    socket.on('join_invite', async ({ inviteCode }) => {
      if (!socket.userId) return socket.emit('error', { message: 'Not authenticated' });

      try {
        const match = await Match.findOne({ inviteCode: inviteCode.toUpperCase(), status: 'waiting' });
        if (!match) return socket.emit('error', { message: 'Invalid or expired invite code' });
        if (match.player1.userId.toString() === socket.userId)
          return socket.emit('error', { message: 'Cannot join your own match' });

        match.player2 = {
          userId: socket.userId,
          username: socket.username,
          codeforcesHandle: socket.codeforcesHandle,
          socketId: socket.id,
        };
        match.status = 'active';
        match.startTime = new Date();

        // Fetch problem
        let problem;
        try {
          problem = await getRandomProblem(match.difficulty);
          match.problem = problem;
        } catch {
          return socket.emit('error', { message: 'Failed to fetch problem. Try again.' });
        }

        await match.save();

        const p1Socket = io.sockets.sockets.get(match.player1.socketId);
        if (p1Socket) p1Socket.join(match.roomId);
        socket.join(match.roomId);
        socket.currentRoom = match.roomId;

        const matchData = {
          roomId: match.roomId,
          problem: match.problem,
          player1: { username: match.player1.username, codeforcesHandle: match.player1.codeforcesHandle },
          player2: { username: match.player2.username, codeforcesHandle: match.player2.codeforcesHandle },
          startTime: match.startTime,
          duration: MATCH_DURATION_MS,
          status: 'active',
        };

        io.to(match.roomId).emit('match_started', matchData);
        startPolling(io, match.roomId, match);
        startMatchTimer(io, match.roomId);
      } catch (err) {
        console.error('[join_invite] Error:', err.message);
        socket.emit('error', { message: 'Failed to join match' });
      }
    });

    // ── MATCH EVENTS ──────────────────────────────────────────────────────
    socket.on('submit_solution', async ({ roomId }) => {
      // Manual check trigger (user says they submitted on CF)
      const match = await Match.findOne({ roomId });
      if (!match || match.status !== 'active') return;
      socket.emit('verdict_checking', { message: 'Checking your submission on Codeforces...' });
    });

    // ── DISCONNECT ────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);

      // Remove from queue
      const qIdx = waitingQueue.findIndex((q) => q.socketId === socket.id);
      if (qIdx !== -1) waitingQueue.splice(qIdx, 1);

      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
      }

      // Handle active match disconnect
      if (socket.currentRoom) {
        const match = await Match.findOne({ roomId: socket.currentRoom, status: 'active' });
        if (match) {
          // Give 60s reconnect window before forfeit
          const disconnectTimer = setTimeout(async () => {
            const updatedMatch = await Match.findOne({ roomId: socket.currentRoom });
            if (updatedMatch?.status === 'active') {
              // Still disconnected — forfeit
              io.to(socket.currentRoom).emit('opponent_disconnected', {
                message: 'Your opponent disconnected. You win!',
              });
            }
          }, 60000);
          activePollers.set(`disconnect_${socket.id}`, disconnectTimer);
        }
      }
    });

    socket.on('reconnect_match', async ({ roomId, userId }) => {
      const match = await Match.findOne({ roomId, status: 'active' });
      if (!match) return socket.emit('error', { message: 'Match not found or already ended' });

      // Clear disconnect forfeit timer
      const t = activePollers.get(`disconnect_${socket.id}`);
      if (t) { clearTimeout(t); activePollers.delete(`disconnect_${socket.id}`); }

      socket.join(roomId);
      socket.currentRoom = roomId;
      socket.userId = userId;

      socket.emit('match_rejoined', {
        roomId: match.roomId,
        problem: match.problem,
        player1: match.player1,
        player2: match.player2,
        startTime: match.startTime,
        duration: MATCH_DURATION_MS,
        status: match.status,
      });
    });
  });
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

async function startMatch(io, socket2, player1Data, difficulty) {
  try {
    let problem;
    try {
      problem = await getRandomProblem(difficulty);
    } catch {
      socket2.emit('error', { message: 'Failed to fetch problem. Please try again.' });
      player1Data.socket.emit('error', { message: 'Failed to fetch problem. Please try again.' });
      return;
    }

    const roomId = uuidv4();
    const now = new Date();

    const match = await Match.create({
      roomId,
      matchType: 'public',
      difficulty,
      status: 'active',
      problem,
      startTime: now,
      player1: {
        userId: player1Data.userId,
        username: player1Data.username,
        codeforcesHandle: player1Data.codeforcesHandle,
        socketId: player1Data.socketId,
      },
      player2: {
        userId: socket2.userId,
        username: socket2.username,
        codeforcesHandle: socket2.codeforcesHandle,
        socketId: socket2.id,
      },
    });

    player1Data.socket.join(roomId);
    socket2.join(roomId);
    player1Data.socket.currentRoom = roomId;
    socket2.currentRoom = roomId;

    const matchData = {
      roomId,
      problem,
      player1: { username: player1Data.username, codeforcesHandle: player1Data.codeforcesHandle },
      player2: { username: socket2.username, codeforcesHandle: socket2.codeforcesHandle },
      startTime: now,
      duration: MATCH_DURATION_MS,
      status: 'active',
    };

    io.to(roomId).emit('match_started', matchData);
    startPolling(io, roomId, match);
    startMatchTimer(io, roomId);

    console.log(`[Match] Started: ${roomId} | ${player1Data.username} vs ${socket2.username}`);
  } catch (err) {
    console.error('[startMatch] Error:', err.message);
  }
}

function startPolling(io, roomId, match) {
  const interval = setInterval(async () => {
    try {
      const currentMatch = await Match.findOne({ roomId });
      if (!currentMatch || currentMatch.status !== 'active') {
        clearInterval(interval);
        activePollers.delete(roomId);
        return;
      }

      const { contestId, index } = currentMatch.problem;
      const startTime = currentMatch.startTime;

      let winner = null;

      // Check player1
      if (!currentMatch.player1.solved && currentMatch.player1.codeforcesHandle) {
        const solved = await checkSolved(currentMatch.player1.codeforcesHandle, contestId, index, startTime);
        if (solved) {
          currentMatch.player1.solved = true;
          currentMatch.player1.solvedAt = new Date();
          if (!winner) winner = 'player1';
          io.to(roomId).emit('player_solved', { player: 'player1', username: currentMatch.player1.username });
        }
      }

      // Check player2
      if (!currentMatch.player2.solved && currentMatch.player2.codeforcesHandle) {
        const solved = await checkSolved(currentMatch.player2.codeforcesHandle, contestId, index, startTime);
        if (solved) {
          currentMatch.player2.solved = true;
          currentMatch.player2.solvedAt = new Date();
          if (!winner) winner = 'player2';
          io.to(roomId).emit('player_solved', { player: 'player2', username: currentMatch.player2.username });
        }
      }

      await currentMatch.save();

      if (winner) {
        clearInterval(interval);
        activePollers.delete(roomId);
        const t = matchTimers.get(roomId);
        if (t) { clearTimeout(t); matchTimers.delete(roomId); }
        await endMatch(io, roomId, winner);
      }
    } catch (err) {
      console.error('[Polling] Error:', err.message);
    }
  }, POLL_INTERVAL_MS);

  activePollers.set(roomId, interval);
}

function startMatchTimer(io, roomId) {
  const timeout = setTimeout(async () => {
    const match = await Match.findOne({ roomId, status: 'active' });
    if (!match) return;
    clearInterval(activePollers.get(roomId));
    activePollers.delete(roomId);
    await endMatch(io, roomId, 'draw');
  }, MATCH_DURATION_MS);

  matchTimers.set(roomId, timeout);
}

async function endMatch(io, roomId, result) {
  try {
    const match = await Match.findOne({ roomId });
    if (!match || match.status !== 'active') return;

    const p1 = await User.findById(match.player1.userId);
    const p2 = await User.findById(match.player2.userId);

    if (!p1 || !p2) return;

    const { player1Change, player2Change } = calculateRatingChange(
      p1.rating,
      p2.rating,
      result
    );

    match.status = 'completed';
    match.endTime = new Date();
    match.player1.ratingChange = player1Change;
    match.player2.ratingChange = player2Change;

    if (result === 'player1') {
      match.winner = p1._id;
      match.winnerUsername = p1.username;
      p1.wins += 1;
      p2.losses += 1;
    } else if (result === 'player2') {
      match.winner = p2._id;
      match.winnerUsername = p2.username;
      p2.wins += 1;
      p1.losses += 1;
    } else {
      p1.draws += 1;
      p2.draws += 1;
    }

    p1.rating = Math.max(100, p1.rating + player1Change);
    p2.rating = Math.max(100, p2.rating + player2Change);
    p1.totalMatches += 1;
    p2.totalMatches += 1;

    // Add to match history
    const historyEntry = (userId, opponent, res, change) => ({
      matchId: match._id,
      opponent,
      result: res,
      ratingChange: change,
      problemTitle: match.problem.title,
      problemUrl: match.problem.url,
      solvedAt: res === 'win' ? (result === 'player1' && userId.equals(p1._id) ? match.player1.solvedAt : match.player2.solvedAt) : null,
      duration: Math.round((match.endTime - match.startTime) / 60000),
      createdAt: new Date(),
    });

    const p1Result = result === 'player1' ? 'win' : result === 'player2' ? 'loss' : 'draw';
    const p2Result = result === 'player2' ? 'win' : result === 'player1' ? 'loss' : 'draw';

    p1.matchHistory.unshift(historyEntry(p1._id, p2.username, p1Result, player1Change));
    p2.matchHistory.unshift(historyEntry(p2._id, p1.username, p2Result, player2Change));

    // Keep only last 50 matches in history
    if (p1.matchHistory.length > 50) p1.matchHistory = p1.matchHistory.slice(0, 50);
    if (p2.matchHistory.length > 50) p2.matchHistory = p2.matchHistory.slice(0, 50);

    await Promise.all([match.save(), p1.save(), p2.save()]);

    io.to(roomId).emit('match_ended', {
      result,
      winner: result !== 'draw' ? (result === 'player1' ? p1.username : p2.username) : null,
      player1: { username: p1.username, ratingChange: player1Change, newRating: p1.rating },
      player2: { username: p2.username, ratingChange: player2Change, newRating: p2.rating },
      problem: match.problem,
    });

    console.log(`[Match] Ended: ${roomId} | Result: ${result}`);
  } catch (err) {
    console.error('[endMatch] Error:', err.message);
  }
}
