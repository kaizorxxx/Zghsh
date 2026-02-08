
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onOpenAuth, onLogout }) => {
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

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!user) {
        alert("Akses Ditolak: Silakan login terlebih dahulu.");
        onOpenAuth();
    } else {
        navigate('/profile'); 
    }
  };

  return (
    <header className="bg-black/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6 lg:gap-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <span className="text-white font-orbitron font-black text-2xl italic">N</span>
            </div>
            <span className="hidden sm:block text-2xl font-orbitron font-black text-white tracking-tighter">
                NOVA<span className="text-red-600">ANIME</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 uppercase text-[10px] font-black tracking-[0.2em] text-zinc-400">
            <Link to="/" className="text-white hover:text-red-500 transition-all border-b-2 border-red-600 pb-1">Beranda</Link>
            <Link to="/" className="hover:text-red-500 transition-all pb-1">Anime TV</Link>
            <Link to="/" className="hover:text-red-500 transition-all pb-1">Movies</Link>
            <a href="#" onClick={(e) => handleNavClick(e, '/favorit')} className="hover:text-red-500 transition-all pb-1">Favorit Saya</a>
            <a href="#" onClick={(e) => handleNavClick(e, '/history')} className="hover:text-red-500 transition-all pb-1 text-red-600/80">Riwayat Tontonan</a>
          </nav>
        </div>

        <div className="flex items-center gap-4 lg:gap-8">
          <form onSubmit={handleSearch} className="relative group hidden md:block">
            <input 
              type="text" 
              placeholder="Cari..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900/80 border border-zinc-800 rounded-full px-6 py-2 text-[11px] w-48 focus:w-64 focus:outline-none focus:border-red-600 focus:bg-zinc-900 transition-all text-white pr-10 placeholder:text-zinc-600 font-bold"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>

          {user ? (
            <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-3 group">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider">{user.username}</p>
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{user.is_vip ? 'PREMIUM' : 'MEMBER'}</p>
                    </div>
                    <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-zinc-800 group-hover:border-red-600 transition-colors object-cover" />
                </Link>
                <button onClick={onLogout} className="text-zinc-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
          ) : (
             <div className="flex items-center gap-3">
                 <button onClick={onOpenAuth} className="text-xs font-black text-white hover:text-red-500 uppercase tracking-wider transition-colors">
                    Masuk
                 </button>
                 <button onClick={onOpenAuth} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                    Daftar
                 </button>
             </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
