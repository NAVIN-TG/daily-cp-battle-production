import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, Github, Heart } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-white/[0.06] mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Swords className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-white">CP<span className="text-brand-400">Battle</span></span>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <Link to="/leaderboard" className="hover:text-gray-300 transition-colors">Leaderboard</Link>
          <Link to="/battle" className="hover:text-gray-300 transition-colors">Battle</Link>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Built with</span>
          <Heart className="w-3 h-3 text-red-500" />
          <span>by</span>
          <a
            href="https://github.com/aliscodess"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            aliscodess
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
