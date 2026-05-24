const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

// GET /api/matches/recent
router.get('/recent', async (req, res, next) => {
  try {
    const matches = await Match.find({ status: 'completed' })
      .sort({ endTime: -1 })
      .limit(20)
      .select('player1.username player2.username winnerUsername problem.title problem.rating endTime player1.ratingChange player2.ratingChange');
    res.json({ success: true, matches });
  } catch (err) { next(err); }
});

// GET /api/matches/live
router.get('/live', async (req, res, next) => {
  try {
    const matches = await Match.find({ status: 'active' })
      .sort({ startTime: -1 })
      .limit(10)
      .select('player1.username player2.username problem.title problem.rating startTime');
    res.json({ success: true, matches });
  } catch (err) { next(err); }
});

module.exports = router;
