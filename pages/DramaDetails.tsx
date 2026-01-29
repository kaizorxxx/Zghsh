
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDramaById, getVideoStream } from '../services/api';
import { Drama, UserProfile } from '../types';
import VideoPlayer from '../components/VideoPlayer';

interface DramaDetailsProps {
  user: UserProfile;
}

const DramaDetails: React.FC<DramaDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  
  const [drama, setDrama] = useState<Drama | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(1);
  const [activeSeason, setActiveSeason] = useState(1);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const playerSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const loadDrama = async () => {
      setLoading(true);
      try {
        const data = await fetchDramaById(id);
        if (data) {
          setDrama(data);
          // Resolve first episode immediately
          const firstStream = await getVideoStream(id, 1);
          setStreamUrl(firstStream);
        }
      } catch (e) {
        console.error("Load failed", e);
      } finally {
        setLoading(false);
      }
    };
    loadDrama();
  }, [id]);

  const handleChapterSelect = async (index: number) => {
    if (!id) return;
    setActiveChapter(index);
    setStreamUrl(null); // Clear to show buffer
    
    // Jump to player for better UX
    playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    const stream = await getVideoStream(id, index);
    setStreamUrl(stream);
  };

  if (loading || !drama) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fadeInUp">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-8 font-orbitron text-[9px] text-zinc-500 uppercase tracking-[0.6em] animate-pulse italic">Memuat Berkas...</p>
      </div>
    );
  }

  // Simulate multiple seasons if the drama has many episodes
  const totalSeasons = Math.ceil(drama.episodes / 24); 
  const seasonList = Array.from({ length: totalSeasons }, (_, i) => i + 1);

  return (
    <div className="space-y-12 animate-fadeInUp" ref={playerSectionRef}>
      {/* Player Area - Optimized for Speed */}
      <VideoPlayer poster={drama.thumbnail} streamUrl={streamUrl} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main Content (Left) */}
        <div className="lg:col-span-3 space-y-12">
          {/* Header & Meta */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {drama.genre.map(g => (
                <span key={g} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900 px-3 py-1 rounded">
                  {g}
                </span>
              ))}
              <span className="text-red-500 font-bold ml-auto text-sm">Transmisi Stabil</span>
            </div>
            
            <h1 className="text-6xl font-black text-white uppercase tracking-tighter italic leading-[0.9]">
              {drama.title}
            </h1>
            
            <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-500">
               <span className="flex items-center gap-2 text-red-600">
                <span className="text-lg">★</span> {drama.rating}
               </span>
               <span className="border-l border-zinc-800 pl-8">{drama.releaseYear}</span>
               <span className="border-l border-zinc-800 pl-8">{drama.episodes} EPISODE</span>
               <span className="bg-zinc-900 text-zinc-400 px-3 py-1 rounded-sm text-[9px]">{drama.status}</span>
            </div>
          </div>

          {/* Episode Selector (Netflix Style) */}
          <div className="space-y-8">
            <div className="flex items-center gap-8 border-b border-zinc-900 pb-4">
              <div className="relative">
                <select 
                  value={activeSeason}
                  onChange={(e) => setActiveSeason(parseInt(e.target.value))}
                  className="bg-zinc-900 text-white font-black text-sm uppercase tracking-widest px-8 py-3 rounded-lg border border-zinc-800 appearance-none hover:border-red-600 transition-colors focus:outline-none"
                >
                  {seasonList.map(s => <option key={s} value={s}>Musim {s}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-red-600">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Pilih Episode Untuk Mulai Streaming</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {Array.from({ length: Math.min(24, drama.episodes - (activeSeason - 1) * 24) }).map((_, i) => {
                const epNum = (activeSeason - 1) * 24 + i + 1;
                const isActive = activeChapter === epNum;
                return (
                  <button 
                    key={epNum} 
                    onClick={() => handleChapterSelect(epNum)}
                    className={`group relative aspect-video rounded-xl flex items-center justify-center font-black transition-all border overflow-hidden ${
                      isActive 
                        ? 'bg-red-600 text-white border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                        : 'bg-zinc-950 text-zinc-600 border-zinc-900 hover:border-red-600/50 hover:text-white'
                    }`}
                  >
                    <span className="relative z-10 text-lg">{epNum}</span>
                    <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-20"></div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info Sidebar (Right) */}
        <div className="space-y-8">
           <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-900 space-y-6">
              <h3 className="text-xs font-black text-red-600 uppercase tracking-[0.4em] italic">Sinopsis</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium italic">
                {drama.description}
              </p>
           </div>

           <div className="bg-zinc-900/30 p-8 rounded-3xl border border-zinc-900/50 space-y-4">
              <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Detail Teknis</h4>
              <div className="space-y-3">
                 <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-zinc-600">Provider</span>
                    <span className="text-white">REBAHIN_NODE_01</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-zinc-600">Kualitas</span>
                    <span className="text-green-500">1080P FULL HD</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-zinc-600">Enkripsi</span>
                    <span className="text-white">SSL SECURE</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DramaDetails;
