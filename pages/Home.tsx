
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [activeFilter, setActiveFilter] = useState('Populärast');

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

  useEffect(() => {
    const initLoad = async () => {
      try {
        setLoading(true);
        const [rankData, initialDramas] = await Promise.all([
          fetchRankings(),
          fetchPaginatedDramas('foryou', 1)
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
  }, []);

  useEffect(() => {
    if (page === 1) return;
    const loadMore = async () => {
      setLoadingMore(true);
      const newDramas = await fetchPaginatedDramas('foryou', page);
      if (newDramas.length === 0) setHasMore(false);
      else setDramas(prev => [...prev, ...newDramas]);
      setLoadingMore(false);
    };
    loadMore();
  }, [page]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filters = ['Populärast', 'Högsta betyg', 'Nyheter', 'Tillagda', 'Sista chansen', 'Personliga rekommendationer', 'A-Ö'];

  return (
    <div className="space-y-12">
      {/* Hero "Kommer Snart" Section */}
      <section className="relative min-h-[450px] flex items-center bg-zinc-950 rounded-lg overflow-hidden border border-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        {dramas.length > 0 && (
          <img 
            src={dramas[0].thumbnail} 
            className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-30 grayscale blur-[2px]" 
            alt="Hero bg" 
          />
        )}
        
        <div className="relative z-20 w-full max-w-5xl mx-auto px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-6xl font-black text-white leading-tight uppercase tracking-tighter">
                Kommer <span className="text-red-600">snart</span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed font-medium">
               Det är snart dags för premiär av draman som {dramas.slice(1,4).map(d => `${d.title} (v 36)`).join(', ')}.
            </p>
            <button className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-red-700 transition-colors shadow-lg">
                Mer film
            </button>
          </div>

          <div className="hidden md:flex justify-center poster-stack h-80 relative">
             {dramas.slice(0, 4).map((d, i) => (
                <div 
                    key={d.id} 
                    className="poster-stack-item absolute h-full aspect-[2/3] border-4 border-white/10 rounded-sm overflow-hidden"
                    style={{ 
                        right: `${i * 60}px`, 
                        zIndex: 10 - i,
                        transform: `translateX(${-i * 10}px) scale(${1 - i * 0.1})`,
                        opacity: 1 - i * 0.2
                    }}
                >
                    <img src={d.thumbnail} className="w-full h-full object-cover" />
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Main Content Filter Area */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Film</h2>
                <select className="bg-zinc-900 border border-zinc-700 text-white text-xs font-bold uppercase p-1.5 rounded-sm outline-none">
                    <option>Samtliga</option>
                    <option>C-Drama</option>
                    <option>Wuxia</option>
                    <option>Romance</option>
                </select>
            </div>
            <div className="flex items-center gap-1">
                <button className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-l-sm">Viaplay</button>
                <button className="bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-r-sm hover:text-white border border-zinc-800">Hyrbutik</button>
            </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-sm overflow-x-auto whitespace-nowrap hide-scrollbar">
            {filters.map(filter => (
                <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest border-r border-zinc-800 last:border-0 transition-colors ${
                        activeFilter === filter ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-12 gap-x-4 pt-4">
          {dramas.map((drama, idx) => (
            <div key={`${drama.id}-${idx}`}>
              <DramaCard drama={drama} />
            </div>
          ))}
        </div>

        {/* Loading Sentinel */}
        <div ref={lastElementRef} className="py-16 flex flex-col items-center">
            {loadingMore ? (
               <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : hasMore ? (
               <button 
                onClick={() => setPage(p => p + 1)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest px-10 py-3 rounded-sm hover:text-white hover:border-zinc-700 transition-all"
               >
                  Visa fler
               </button>
            ) : (
               <div className="text-zinc-700 text-xs font-bold uppercase tracking-widest italic">-- Slutet på katalogen --</div>
            )}
        </div>
      </section>
    </div>
  );
};

export default Home;