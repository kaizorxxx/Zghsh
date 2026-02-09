
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getHome, search, getBatch } from '../services/api';
import { supabase } from '../services/supabase';
import { getAiSuggestions } from '../services/gemini';
import { AnimeItem } from '../types';
import AnimeCard from '../components/DramaCard';

const Home: React.FC = () => {
  const [latest, setLatest] = useState<AnimeItem[]>([]);
  const [popular, setPopular] = useState<AnimeItem[]>([]);
  const [featured, setFeatured] = useState<AnimeItem | null>(null);
  const [aiReason, setAiReason] = useState<string>("");
  const [searchResults, setSearchResults] = useState<AnimeItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');

  // Helper to shuffle array
  const shuffle = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    supabase.incrementView();
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
              
              // Randomly pick a featured drama from the top 5
              const topDramas = homeRes.data.anime.slice(0, 5);
              const selected = topDramas[Math.floor(Math.random() * topDramas.length)];
              setFeatured(selected);
              
              // Get AI Recommendation for the featured one
              if (selected) {
                const suggestion = await getAiSuggestions(selected.title);
                setAiReason(suggestion || "");
              }
          }
          if (batchRes.data && Array.isArray(batchRes.data.anime)) {
              // Shuffle popular dramas to make it look fresh
              setPopular(shuffle(batchRes.data.anime).slice(0, 15));
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
          {/* Featured Hero (Dynamic selection) */}
          {featured && (
            <section className="relative h-[75vh] min-h-[500px] rounded-[4rem] overflow-hidden group shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5">
              <img 
                src={featured.image || featured.thumbnail} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5000ms] opacity-60" 
                alt="Hero" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              
              <div className="absolute bottom-16 left-8 md:left-16 right-8 md:right-16 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-lg tracking-[0.2em] shadow-lg shadow-red-600/40 uppercase animate-glowPulse">NEURAL FEATURED</span>
                  <span className="text-cyan-400 font-orbitron text-[9px] font-bold tracking-[0.3em] uppercase">Status: Broadcasting</span>
                </div>
                
                <h1 className="text-5xl md:text-8xl font-black text-white leading-tight uppercase tracking-tighter italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] max-w-4xl">
                  {featured.title}
                </h1>

                {aiReason && (
                    <div className="max-w-2xl bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 animate-fadeInUp stagger-2">
                        <div className="text-red-500 font-orbitron text-[8px] font-black tracking-[0.5em] mb-2 uppercase">AI Insights by Gemini-3</div>
                        <div className="text-zinc-300 text-xs font-medium leading-relaxed prose prose-invert prose-sm">
                            {aiReason.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{line}</p>)}
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-6 pt-4">
                  <Link to={`/drama/${featured.slug}`} className="group/btn relative bg-white text-black px-16 py-6 rounded-full font-black uppercase text-[10px] tracking-[0.3em] overflow-hidden shadow-2xl active:scale-95 transition-all">
                    <div className="absolute inset-0 bg-red-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                    <span className="relative z-10 group-hover/btn:text-white transition-colors">INITIATE PLAYBACK</span>
                  </Link>
                  <div className="flex flex-col justify-center">
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Episode {featured.episode || featured.latest_episode}</p>
                    <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">{featured.type} • Sub Indonesia</p>
                  </div>
                </div>
              </div>

              {/* Decorative HUD */}
              <div className="absolute top-12 right-12 hidden lg:flex flex-col items-end gap-2 text-zinc-500 font-mono text-[9px]">
                 <p className="tracking-widest">ENCRYPTION: AES-256</p>
                 <p className="tracking-widest">UPLINK: ACTIVE</p>
                 <div className="w-32 h-[1px] bg-zinc-800 mt-2"></div>
              </div>
            </section>
          )}

          {/* Popular Top Section (Randomized Order) */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                <span className="w-2 h-8 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)]"></span>
                Populer Hari Ini
              </h2>
              <div className="h-[1px] flex-grow mx-8 bg-zinc-800"></div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Updated Realtime</p>
            </div>
            
            <div className="relative w-full">
                <div className="flex overflow-x-auto hide-scrollbar gap-8 pb-10 px-4 snap-x snap-mandatory">
                {popular.map((anime, idx) => (
                    <div key={`${anime.slug}-${idx}`} className="relative flex-none group w-[180px] sm:w-[240px] snap-center hover:z-20">
                        <div className="flex items-end">
                            {/* Rank Number */}
                            <span 
                                className="text-[130px] sm:text-[180px] font-black leading-none -mr-10 mb-[-30px] z-0 relative select-none transition-transform group-hover:-translate-x-4 duration-500"
                                style={{
                                    WebkitTextStroke: '2px #ef4444',
                                    color: 'transparent',
                                    opacity: '0.2',
                                    fontStyle: 'italic'
                                }}
                            >
                                {idx + 1}
                            </span>
                            
                            {/* Card with neon hover */}
                            <Link to={`/drama/${anime.slug}`} className="relative z-10 w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/5 group-hover:scale-105 transition-all duration-500 group-hover:border-red-600 group-hover:shadow-[0_0_40px_rgba(220,38,38,0.3)] block bg-zinc-900">
                                <img src={anime.image || anime.thumbnail} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-xs text-white font-black truncate uppercase tracking-tight italic mb-1">{anime.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black">EP {anime.episode || anime.latest_episode}</span>
                                        <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">{anime.type}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                ))}
                </div>
            </div>
          </section>

          {/* Latest Updates Grid */}
          <section className="space-y-12">
             <div className="flex items-center gap-6">
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Update Terbaru</h2>
                <div className="h-[2px] flex-grow bg-gradient-to-r from-red-600 via-red-600/20 to-transparent"></div>
                <Link to="/" className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">Lihat Semua</Link>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
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
