
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getHome, search, getBatch } from '../services/api';
import { supabase } from '../services/supabase';
import { AnimeItem } from '../types';
import AnimeCard from '../components/DramaCard';

const Home: React.FC = () => {
  const [latest, setLatest] = useState<AnimeItem[]>([]);
  const [popular, setPopular] = useState<AnimeItem[]>([]);
  const [searchResults, setSearchResults] = useState<AnimeItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');

  useEffect(() => {
    supabase.incrementView(); // Track view for admin dashboard
    const loadHome = async () => {
      setLoading(true);
      try {
        if (query) {
          const res = await search(query);
          if (res.data && Array.isArray(res.data.anime)) {
             setSearchResults(res.data.anime);
          } else {
             setSearchResults([]);
          }
        } else {
          setSearchResults(null);
          const [homeRes, batchRes] = await Promise.all([
            getHome(1),
            getBatch(1)
          ]);
          
          if (homeRes.data && Array.isArray(homeRes.data.anime)) {
              setLatest(homeRes.data.anime);
          }
          if (batchRes.data && Array.isArray(batchRes.data.anime)) {
              // Using batch/recommended as the "Popular" data source
              setPopular(batchRes.data.anime.slice(0, 15)); // Get more for scrolling
          }
        }
      } catch (err) {
        console.error("Signal Lost:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHome();
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
            <div className="w-20 h-20 border-[3px] border-red-600/10 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-t-[3px] border-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border border-red-500/20 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center space-y-2">
            <p className="font-orbitron font-black text-red-600 tracking-[0.4em] animate-pulse uppercase italic">Membangun Tautan...</p>
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Menghubungkan ke Node RGS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20 animate-fadeInUp">
      {/* Content Rendering */}
      {searchResults ? (
        <section className="space-y-10 animate-fadeInUp">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Hasil Pencarian: "{query}"</h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-red-600 to-transparent"></div>
          </div>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
              {searchResults.map((anime, idx) => <AnimeCard key={`${anime.slug}-${idx}`} drama={anime} />)}
            </div>
          ) : (
            <div className="py-20 text-center glass rounded-[3rem] border-white/5">
              <p className="text-zinc-500 font-bold italic uppercase tracking-[0.3em]">Tidak ada sinyal yang cocok ditemukan.</p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Featured Hero (Using first item from Latest) */}
          {latest.length > 0 && (
            <section className="relative h-[70vh] rounded-[4rem] overflow-hidden group shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <img src={latest[0].image || latest[0].thumbnail} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div className="absolute bottom-16 left-12 right-12 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="bg-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full tracking-widest shadow-lg shadow-red-600/40 uppercase">Rilis Baru</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter italic drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                  {latest[0].title}
                </h1>
                <p className="text-zinc-300 text-lg font-medium italic opacity-70">
                   EPISODE {latest[0].episode || latest[0].latest_episode} • {latest[0].type}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link to={`/drama/${latest[0].slug}`} className="bg-white text-black px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95">
                    NONTON SEKARANG
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Popular Top 10 Section (Side Scrolling) */}
          <section className="space-y-8">
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-600 rounded-full animate-pulse"></span>
                Populer Hari Ini
              </h2>
            </div>
            
            <div className="relative w-full">
                {/* Fade effect edges */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

                <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-10 px-4 snap-x snap-mandatory">
                {popular.map((anime, idx) => (
                    <div key={`${anime.slug}-${idx}`} className="relative flex-none group w-[160px] sm:w-[220px] snap-center">
                        <div className="flex items-end">
                            {/* Huge Number */}
                            <span 
                                className="text-[120px] sm:text-[160px] font-black leading-none -mr-8 mb-[-20px] z-0 relative select-none"
                                style={{
                                    WebkitTextStroke: '4px #444',
                                    color: 'black',
                                    textShadow: '0 0 20px rgba(0,0,0,0.8)'
                                }}
                            >
                                {idx + 1}
                            </span>
                            
                            {/* Card */}
                            <Link to={`/drama/${anime.slug}`} className="relative z-10 w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-300 group-hover:border-red-600 block bg-zinc-900">
                                <img src={anime.image || anime.thumbnail} className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-[10px] text-white font-bold truncate">{anime.title}</p>
                                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">EP {anime.episode || anime.latest_episode}</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                ))}
                </div>
            </div>
          </section>

          {/* Latest Updates Grid */}
          <section className="space-y-10">
             <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Update Terbaru</h2>
                <div className="h-[2px] flex-grow bg-gradient-to-r from-red-600 to-transparent"></div>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
                {latest.map((anime, idx) => (
                   <AnimeCard key={`${anime.slug}-latest-${idx}`} drama={anime} />
                ))}
             </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
