
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
    <header className="bg-black/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <span className="text-white font-orbitron font-black text-2xl italic">N</span>
            </div>
            <span className="text-2xl font-orbitron font-black text-white tracking-tighter">
                NOVA<span className="text-red-600">ANIME</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 uppercase text-[11px] font-black tracking-[0.2em] text-zinc-400">
            <Link to="/" className="text-white hover:text-red-500 transition-all border-b-2 border-red-600 pb-1">Beranda</Link>
            <Link to="/" className="hover:text-red-500 transition-all pb-1">Anime TV</Link>
            <Link to="/" className="hover:text-red-500 transition-all pb-1">Movies</Link>
            <Link to="/profile" className="hover:text-red-500 transition-all pb-1">Favorit Saya</Link>
          </nav>
        </div>

        <div className="flex items-center gap-8">
          <form onSubmit={handleSearch} className="relative group hidden md:block">
            <input 
              type="text" 
              placeholder="Cari Judul Anime..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900/80 border border-zinc-800 rounded-full px-6 py-2 text-[11px] w-64 focus:w-80 focus:outline-none focus:border-red-600 focus:bg-zinc-900 transition-all text-white pr-12 placeholder:text-zinc-600 font-bold"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>

          <Link to="/profile" className="flex items-center gap-3 group">
            <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-white uppercase tracking-wider">{user.username}</p>
                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{user.is_vip ? 'PREMIUM ACCESS' : 'FREE USER'}</p>
            </div>
            <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-zinc-800 group-hover:border-red-600 transition-colors object-cover" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
