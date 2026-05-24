import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swords, Zap, Trophy, Users, Timer, ChevronRight, Code2, Globe, TrendingUp } from 'lucide-react';
import { matchesAPI } from '../services/api';
import { Card, Badge, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Swords,
    title: 'Real-Time Battles',
    desc: 'Challenge opponents live in 1v1 coding duels powered by Socket.IO.',
    color: 'text-brand-400',
    bg: 'bg-brand-600/10',
  },
  {
    icon: Code2,
    title: 'Codeforces Problems',
    desc: 'Fresh random problems from Codeforces API every match.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Zap,
    title: 'Elo Rating System',
    desc: 'Track progress with a competitive Elo rating system.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Trophy,
    title: 'Global Leaderboard',
    desc: 'Compete for top spots on the global rankings.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Globe,
    title: 'Invite System',
    desc: 'Challenge a specific friend with shareable invite codes.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Timer,
    title: '30-Minute Sprints',
    desc: 'Intense timed matches that keep you on your toes.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
];

const STATS = [
  { label: 'Active Battles', value: '1,200+', icon: Swords },
  { label: 'Users', value: '4,500+', icon: Users },
  { label: 'Problems Solved', value: '28,000+', icon: Code2 },
  { label: 'Rating Points Given', value: '2M+', icon: TrendingUp },
];

const Landing = () => {
  const { user } = useAuth();
  const [liveMatches, setLiveMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [live, recent] = await Promise.all([
          matchesAPI.getLive(),
          matchesAPI.getRecent(),
        ]);
        setLiveMatches(live.data.matches.slice(0, 5));
        setRecentMatches(recent.data.matches.slice(0, 5));
      } catch {
        // silently fail — optional data
      } finally {
        setLoadingLive(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live competitive coding battles
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl text-white leading-tight mb-6 animate-slide-up">
            Code Faster.
            <br />
            <span className="gradient-text">Battle Harder.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
            1v1 real-time competitive programming battles using Codeforces problems.
            Sharpen your skills, climb the leaderboard, and prove you're the fastest coder.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {user ? (
              <Link to="/battle" className="btn-primary text-lg px-8 py-4">
                <Swords className="w-5 h-5" />
                Start Battle
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  <Zap className="w-5 h-5" />
                  Get Started Free
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/leaderboard" className="btn-secondary text-lg px-8 py-4">
                  <Trophy className="w-5 h-5" />
                  View Rankings
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass p-5 text-center">
                <Icon className="w-5 h-5 text-brand-400 mx-auto mb-2" />
                <p className="font-display font-bold text-2xl text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Everything you need to compete
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              A full-featured battle platform built for competitive programmers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <Card key={title} glow className="group">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Matches ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <h2 className="font-display font-bold text-2xl text-white">Live Battles</h2>
            </div>
            <Link to="/battle" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Join battle <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingLive ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : liveMatches.length > 0 ? (
            <div className="space-y-3">
              {liveMatches.map((m, i) => (
                <div key={i} className="glass p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                    <span className="text-sm font-medium text-white">
                      {m.player1?.username} <span className="text-gray-500">vs</span> {m.player2?.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {m.problem?.rating && <Badge variant="brand">{m.problem.rating}</Badge>}
                    <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[160px]">
                      {m.problem?.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass p-8 text-center text-gray-500">
              <Swords className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No live battles right now. Be the first!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      {!user && (
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-purple-600/10 pointer-events-none" />
              <h2 className="font-display font-bold text-3xl text-white mb-4 relative">
                Ready to battle?
              </h2>
              <p className="text-gray-400 mb-8 relative">
                Join thousands of competitive programmers. Create your account and start your first battle today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                <Link to="/register" className="btn-primary px-8 py-3">
                  <Zap className="w-4 h-4" />
                  Create Account
                </Link>
                <Link to="/login" className="btn-secondary px-8 py-3">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Landing;
