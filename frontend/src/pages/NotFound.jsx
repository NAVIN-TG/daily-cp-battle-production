import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Swords } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="text-center">
      <p className="font-display font-bold text-[8rem] leading-none text-white/5 select-none">404</p>
      <h1 className="font-display font-bold text-3xl text-white -mt-6 mb-3">Page not found</h1>
      <p className="text-gray-400 mb-8 max-w-sm">
        This page doesn't exist or was moved. Head back to keep battling.
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/" className="btn-secondary">
          <Home className="w-4 h-4" />
          Home
        </Link>
        <Link to="/battle" className="btn-primary">
          <Swords className="w-4 h-4" />
          Battle
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
