
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-black/95 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                <span className="text-white font-orbitron font-black text-xl italic">N</span>
            </div>
            <span className="text-xl font-orbitron font-black text-white tracking-tighter">
                NOVA<span className="text-red-600 group-hover:text-red-500 transition-colors">DRAMA</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 uppercase text-[10px] font-black tracking-[0.2em] text-zinc-500">
            <Link to="/" className="text-white hover:text-red-500 transition-all border-b-2 border-transparent hover:border-red-600 pb-1">TV</Link>
            <Link to="/" className="hover:text-red-500 transition-all border-b-2 border-transparent hover:border-red-600 pb-1">Film</Link>
            <Link to="/" className="hover:text-red-500 transition-all border-b-2 border-transparent hover:border-red-600 pb-1">Sport</Link>
            <Link to="/about" className="hover:text-red-500 transition-all border-b-2 border-transparent hover:border-red-600 pb-1">Nova VIP</Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white">
             <Link to="/profile" className="hover:text-red-500 transition-colors flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                {user.is_vip ? 'VIP DASHBOARD' : 'LOGGA IN'}
             </Link>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              placeholder="Cari Arsip..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-700 rounded-sm px-4 py-1.5 text-xs w-48 focus:w-64 focus:outline-none focus:border-red-600 focus:bg-zinc-900 transition-all text-white pr-10 placeholder:text-zinc-600"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
