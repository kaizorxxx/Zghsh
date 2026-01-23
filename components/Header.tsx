
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [search, setSearch] = useState('');

  return (
    <header className="bg-black border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-orbitron font-black text-xl italic">N</span>
            </div>
            <span className="text-xl font-orbitron font-black text-white tracking-tighter">
                NOVA<span className="text-red-600">DRAMA</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 uppercase text-xs font-bold tracking-widest text-zinc-400">
            <Link to="/" className="text-white hover:text-red-500 transition-colors">TV</Link>
            <Link to="/" className="hover:text-red-500 transition-colors">Film</Link>
            <Link to="/" className="hover:text-red-500 transition-colors">Sport</Link>
            <Link to="/about" className="hover:text-red-500 transition-colors">Viaplay Nova</Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white">
             <Link to="/profile" className="hover:text-red-500">{user.is_vip ? 'VIP DASHBOARD' : 'Logga in'}</Link>
          </div>

          <div className="relative group">
            <input 
              type="text" 
              placeholder="Sök" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-1.5 text-sm w-48 focus:w-64 focus:outline-none focus:border-red-600 transition-all text-white pr-8"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;