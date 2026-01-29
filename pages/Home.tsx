
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchPaginatedDramas, fetchRankings } from '../services/api';
import { Drama } from '../types';
import DramaCard from '../components/DramaCard';

const Home: React.FC = () => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [rankings, setRankings] = useState<Drama[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Beranda');
  const [fadeKey, setFadeKey] = useState(0);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  // Initial Load & Filter/Search Change
  useEffect(() => {
    const initLoad = async () => {
      try {
        setLoading(true);
        setPage(1);
        setHasMore(true);
        setFadeKey(prev => prev + 1); 
        
        const [rankData, initialDramas] = await Promise.all([
          fetchRankings(),
          fetchPaginatedDramas(activeFilter, 1, searchQuery || undefined)
        ]);
        setRankings(rankData);
        setDramas(initialDramas);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initLoad();
  }, [activeFilter, searchQuery]);

  // Infinite Scroll Load
  useEffect(() => {
    if (page === 1) return;
    const loadMore = async () => {
      setLoadingMore(true);
      const newDramas = await fetchPaginatedDramas(activeFilter, page, searchQuery || undefined);
      if (newDramas.length === 0) setHasMore(false);
      else setDramas(prev => [...prev, ...newDramas]);
      setLoadingMore(false);
    };
    loadMore();
  }, [page]);

  const filters = ['Beranda', 'Trending', 'Film', 'Serial', 'Anime'];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section with Smooth Fade - Hidden during search */}
      {!searchQuery && (
        <section className="relative min-h-[480px] flex items-center bg-zinc-950 rounded-[2rem] overflow-hidden border border-zinc-900 shadow-2xl transition-all duration-700 animate-fadeInUp">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
          {dramas.length > 0 && (
            <img 
              key={`hero-${fadeKey}`}
              src={dramas[0].thumbnail} 
              className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-20 grayscale blur-[4px] animate-[fadeIn_1.5s_ease]" 
              alt="Hero bg" 
            />
          )}
          
          <div className="relative z-20 w-full max-w-6xl mx-auto px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                  <span className="w-12 h-[2px] bg-red-600"></span>
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Uplink Active</span>
              </div>
              <h1 className="text-7xl font-black text-white leading-[0.9] uppercase tracking-tighter">
                  Explore <br/> <span className="text-red-600">{activeFilter}</span>
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed font-medium max-w-sm">
                 Akses langsung ke transmisi terbaru dari Rebahin Node. Mulai perjalanan Anda di dunia digital.
              </p>
              <div className="flex gap-4">
                  <button className="bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.2em] px-10 py-4 rounded-full hover:bg-red-700 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:scale-105 active:scale-95">
                      Stream Now
                  </button>
                  <button className="glass text-white text-[11px] font-black uppercase tracking-[0.2em] px-10 py-4 rounded-full hover:bg-white/10 transition-all">
                      Details
                  </button>
              </div>
            </div>

            <div className="hidden md:flex justify-end h-80 relative">
               {dramas.slice(0, 3).map((d, i) => (
                  <div 
                      key={`${d.id}-stack-${fadeKey}`} 
                      className="absolute h-full aspect-[2/3] border-4 border-white/5 rounded-2xl overflow-hidden transition-all duration-700 animate-fadeInUp"
                      style={{ 
                          right: `${i * 80}px`, 
                          zIndex: 10 - i,
                          transform: `translateX(${-i * 20}px) scale(${1 - i * 0.1})`,
                          opacity: 1 - i * 0.3,
                          animationDelay: `${i * 0.15}s`
                      }}
                  >
                      <img src={d.thumbnail} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
               ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <section className="space-y-8 animate-fadeInUp stagger-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                  {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Transmissions'}
                </h2>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em]">Synchronizing with global archive...</p>
            </div>
            {!searchQuery && (
              <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-full border border-zinc-800">
                  <button className="bg-red-600 text-white text-[9px] font-black uppercase px-6 py-2.5 rounded-full shadow-lg">Nova Stream</button>
                  <button className="text-zinc-500 text-[9px] font-black uppercase px-6 py-2.5 rounded-full hover:text-white transition-colors">VIP Store</button>
              </div>
            )}
        </div>

        {/* Categories Scroller - Hidden during search */}
        {!searchQuery && (
          <div className="flex items-center gap-2 pb-4 overflow-x-auto hide-scrollbar">
              {filters.map((filter) => (
                  <button 
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-full transition-all duration-500 border ${
                          activeFilter === filter 
                          ? 'bg-red-600 text-white border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
                          : 'bg-zinc-900/30 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600'
                      }`}
                  >
                      {filter}
                  </button>
              ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
            {Array.from({ length: 14 }).map((_, i) => (
               <div key={i} className="aspect-[12/17] bg-zinc-900 rounded-2xl animate-pulse shimmer"></div>
            ))}
          </div>
        ) : (
          <>
            {dramas.length > 0 ? (
              <div key={`grid-${fadeKey}`} className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
                {dramas.map((drama, idx) => (
                  <div 
                    key={`${drama.id}-${idx}`} 
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${(idx % 14) * 0.05}s` }}
                  >
                    <DramaCard drama={drama} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                 <p className="text-zinc-600 font-orbitron text-xs tracking-widest uppercase italic">SIGNAL TIDAK DITEMUKAN</p>
                 <p className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.2em]">Coba kata kunci lain dalam database Rebahin.</p>
              </div>
            )}
          </>
        )}

        {/* Infinite Scroll Indicator */}
        {dramas.length > 0 && (
          <div ref={lastElementRef} className="pt-20 flex flex-col items-center">
              {loadingMore ? (
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-[1px] bg-red-600 animate-pulse"></div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.6em]">Receiving Packets...</p>
                 </div>
              ) : hasMore ? (
                 <button 
                  onClick={() => setPage(p => p + 1)}
                  className="group relative px-16 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-full overflow-hidden hover:scale-105 active:scale-95 transition-all"
                 >
                    <span className="relative z-10">Expand Network</span>
                    <div className="absolute inset-0 bg-red-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                 </button>
              ) : (
                 <div className="flex items-center gap-6 text-zinc-800 text-[10px] font-black uppercase tracking-[1em]">
                    <div className="w-20 h-[1px] bg-zinc-900"></div>
                    SIGNAL STABLE
                    <div className="w-20 h-[1px] bg-zinc-900"></div>
                 </div>
              )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
