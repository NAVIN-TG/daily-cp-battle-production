import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Zap, Swords, Medal } from 'lucide-react';
import { leaderboardAPI } from '../services/api';
import { Badge, OnlineDot, SkeletonCard, EmptyState, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const RANK_STYLES = [
  { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: '🥇' },
  { bg: 'bg-gray-400/10', text: 'text-gray-300', border: 'border-gray-400/20', icon: '🥈' },
  { bg: 'bg-orange-600/15', text: 'text-orange-400', border: 'border-orange-500/20', icon: '🥉' },
];

const getRatingTier = (rating) => {
  if (rating >= 2400) return { label: 'Grandmaster', color: 'red' };
  if (rating >= 2100) return { label: 'Master', color: 'orange' };
  if (rating >= 1900) return { label: 'Candidate', color: 'yellow' };
  if (rating >= 1600) return { label: 'Expert', color: 'purple' };
  if (rating >= 1400) return { label: 'Specialist', color: 'cyan' };
  if (rating >= 1200) return { label: 'Pupil', color: 'green' };
  return { label: 'Newbie', color: 'default' };
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await leaderboardAPI.get(1, 50);
        setUsers(data.users);
      } catch {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const myRank = users.findIndex((u) => u.username === user?.username) + 1;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-yellow-400" />
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-2">Leaderboard</h1>
          <p className="text-gray-400">Top competitive programmers ranked by Elo rating</p>
          {myRank > 0 && (
            <p className="text-sm text-brand-400 mt-2">
              Your rank: <span className="font-bold">#{myRank}</span>
            </p>
          )}
        </div>

        {/* Top 3 podium */}
        {!loading && users.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[users[1], users[0], users[2]].map((u, i) => {
              const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
              const style = RANK_STYLES[actualRank - 1];
              const tier = getRatingTier(u.rating);
              return (
                <Link
                  key={u._id}
                  to={`/profile/${u.username}`}
                  className={`glass p-4 text-center border ${style.border} hover:scale-105 transition-transform ${actualRank === 1 ? 'ring-1 ring-yellow-500/30' : ''}`}
                >
                  <div className="text-3xl mb-2">{style.icon}</div>
                  <p className="font-display font-bold text-sm text-white truncate">{u.username}</p>
                  <p className={`font-mono text-lg font-bold ${style.text}`}>{u.rating}</p>
                  <Badge variant={tier.color} className="mt-1 text-xs">{tier.label}</Badge>
                </Link>
              );
            })}
          </div>
        )}

        {/* Table */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <EmptyState
              icon={Trophy}
              title="Failed to load"
              description={error}
            />
          ) : users.length === 0 ? (
            <EmptyState
              icon={Swords}
              title="No players yet"
              description="Be the first to complete a match and appear on the leaderboard!"
            />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-2 text-right">Rating</div>
                <div className="col-span-2 text-right">W/L</div>
                <div className="col-span-2 text-right hidden sm:block">Matches</div>
                <div className="col-span-1 text-right hidden sm:block">WR%</div>
              </div>

              {users.map((u, index) => {
                const rank = index + 1;
                const tier = getRatingTier(u.rating);
                const isMe = u.username === user?.username;
                const winRate = u.totalMatches > 0 ? Math.round((u.wins / u.totalMatches) * 100) : 0;

                return (
                  <Link
                    key={u._id}
                    to={`/profile/${u.username}`}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.03] transition-colors group ${
                      isMe ? 'bg-brand-600/5 border-l-2 border-brand-500' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      {rank <= 3 ? (
                        <span className="text-lg">{RANK_STYLES[rank - 1].icon}</span>
                      ) : (
                        <span className="text-sm text-gray-500 font-mono">{rank}</span>
                      )}
                    </div>

                    {/* Player */}
                    <div className="col-span-4 flex items-center gap-2.5">
                      <OnlineDot online={u.isOnline} />
                      <div className="min-w-0">
                        <p className={`font-medium text-sm truncate ${isMe ? 'text-brand-300' : 'text-white'} group-hover:text-brand-300 transition-colors`}>
                          {u.username}
                          {isMe && <span className="text-xs text-brand-400 ml-1">(you)</span>}
                        </p>
                        {u.codeforcesHandle && (
                          <p className="text-xs text-gray-500 truncate font-mono">{u.codeforcesHandle}</p>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="col-span-2 text-right">
                      <p className="font-mono font-bold text-white">{u.rating}</p>
                      <Badge variant={tier.color} className="text-xs">{tier.label}</Badge>
                    </div>

                    {/* W/L */}
                    <div className="col-span-2 text-right">
                      <span className="text-green-400 text-sm font-medium">{u.wins}W</span>
                      <span className="text-gray-600 text-sm mx-1">/</span>
                      <span className="text-red-400 text-sm font-medium">{u.losses}L</span>
                    </div>

                    {/* Matches */}
                    <div className="col-span-2 text-right hidden sm:block">
                      <span className="text-sm text-gray-400">{u.totalMatches}</span>
                    </div>

                    {/* Win rate */}
                    <div className="col-span-1 text-right hidden sm:block">
                      <span className={`text-sm font-medium ${winRate >= 60 ? 'text-green-400' : winRate >= 40 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {winRate}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
