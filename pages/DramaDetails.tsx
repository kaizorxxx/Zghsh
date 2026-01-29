
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { fetchDramaById, getVideoStream } from '../services/api';
import { Drama, UserProfile } from '../types';
import VideoPlayer from '../components/VideoPlayer';

interface DramaDetailsProps {
  user: UserProfile;
}

const DramaDetails: React.FC<DramaDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Gunakan data dari state navigasi jika ada (Optimistic Load)
  const [drama, setDrama] = useState<Drama | null>(location.state?.drama || null);
  const [loading, setLoading] = useState(!location.state?.drama);
  const [activeChapter, setActiveChapter] = useState(1);
  const [activeSeason, setActiveSeason] = useState(1);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  
  // Auto-play State
  const [autoPlayActive, setAutoPlayActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isFinished, setIsFinished] = useState(false);
  
  const playerSectionRef = useRef<HTMLDivElement>(null);
  const episodesPerSeason = 12;

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      if (!drama) {
        setLoading(true);
        try {
          const data = await fetchDramaById(id);
          if (data) setDrama(data);
        } catch (e) {
          console.error("Meta load failed", e);
        } finally {
          setLoading(false);
        }
      }

      // Ambil stream url
      try {
        const firstStream = await getVideoStream(id, 1);
        setStreamUrl(firstStream);
      } catch (e) {
         console.warn("Stream load failed", e);
      }
    };
    loadData();
  }, [id]);

  // Countdown Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (autoPlayActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (autoPlayActive && countdown === 0) {
      playNextEpisode();
    }
    return () => clearInterval(interval);
  }, [autoPlayActive, countdown]);

  const handleChapterSelect = async (index: number) => {
    if (!id) return;
    // Reset Auto-play states
    setAutoPlayActive(false);
    setIsFinished(false);
    setCountdown(10);

    setActiveChapter(index);
    setStreamUrl(null); 
    
    // Ensure correct season tab is active
    const requiredSeason = Math.ceil(index / episodesPerSeason);
    if (requiredSeason !== activeSeason) {
        setActiveSeason(requiredSeason);
    }

    playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    const stream = await getVideoStream(id, index);
    setStreamUrl(stream);
  };

  const handleVideoEnded = () => {
    if (!drama) return;

    if (activeChapter < drama.episodes) {
        // Prepare for next episode
        setCountdown(10);
        setAutoPlayActive(true);
    } else {
        // Series Finished
        setIsFinished(true);
    }
  };

  const playNextEpisode = () => {
    handleChapterSelect(activeChapter + 1);
  };

  const cancelAutoPlay = () => {
    setAutoPlayActive(false);
    setCountdown(10);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fadeInUp">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-red-600/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-8 font-orbitron text-[9px] text-red-600 uppercase tracking-[0.5em] animate-pulse italic">Sinkronisasi Jalur Data...</p>
      </div>
    );
  }

  if (!drama) {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fadeInUp text-center space-y-6">
            <div className="text-6xl text-red-600 font-orbitron">404</div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Signal Lost</h2>
            <p className="text-zinc-500 max-w-md">Koneksi ke arsip Rebahin terputus. Silakan coba kembali ke beranda.</p>
            <Link to="/" className="px-8 py-3 bg-red-600 text-white font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition-colors">
                Reconnect
            </Link>
        </div>
    );
  }

  const totalSeasons = Math.max(1, Math.ceil(drama.episodes / episodesPerSeason));
  const seasonList = Array.from({ length: totalSeasons }, (_, i) => i + 1);

  const startIdx = (activeSeason - 1) * episodesPerSeason;
  const endIdx = Math.min(drama.episodes, activeSeason * episodesPerSeason);
  const currentSeasonEpisodes = Array.from({ length: endIdx - startIdx }, (_, i) => startIdx + i + 1);

  // Overlay Content Generation
  let overlayContent = null;
  if (autoPlayActive) {
    overlayContent = (
        <div className="text-center space-y-8 animate-fadeInUp">
            <div className="space-y-2">
                <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.4em]">Transmission Complete</p>
                <h3 className="text-3xl font-orbitron font-black text-white italic">NEXT EPISODE</h3>
            </div>
            
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="60" stroke="#1f2937" strokeWidth="4" fill="none" />
                    <circle 
                        cx="64" cy="64" r="60" stroke="#dc2626" strokeWidth="4" fill="none" 
                        strokeDasharray="377" 
                        strokeDashoffset={377 - (377 * countdown) / 10}
                        className="transition-[stroke-dashoffset] duration-1000 linear"
                    />
                </svg>
                <span className="text-5xl font-black text-white font-orbitron">{countdown}</span>
            </div>

            <div className="flex items-center justify-center gap-6">
                <button 
                    onClick={cancelAutoPlay}
                    className="px-8 py-3 border border-zinc-700 hover:bg-zinc-800 text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Cancel
                </button>
                <button 
                    onClick={playNextEpisode}
                    className="px-10 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:scale-105 transition-all"
                >
                    Play Now
                </button>
            </div>
        </div>
    );
  } else if (isFinished) {
    overlayContent = (
        <div className="text-center space-y-8 animate-fadeInUp p-10 glass rounded-[3rem] border-red-600/20">
            <div className="space-y-4">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(220,38,38,0.5)] mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-4xl font-orbitron font-black text-white italic">SERIES COMPLETE</h3>
                <p className="text-zinc-400 text-sm max-w-md mx-auto">
                    You have successfully decrypted all episodes of <span className="text-white font-bold">{drama.title}</span>.
                </p>
            </div>
            
            <div className="flex items-center justify-center gap-6 pt-4">
                <button 
                    onClick={() => handleChapterSelect(1)}
                    className="px-8 py-3 glass hover:bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Replay
                </button>
                <Link 
                    to="/"
                    className="px-10 py-3 bg-white text-black hover:bg-zinc-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeInUp" ref={playerSectionRef}>
      <VideoPlayer 
        poster={drama.thumbnail} 
        streamUrl={streamUrl} 
        onEnded={handleVideoEnded}
        overlay={overlayContent}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {drama.genre.slice(0, 4).map(g => (
                <span key={g} className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-600/5 px-4 py-1.5 rounded-full border border-red-500/20">
                  {g}
                </span>
              ))}
              <div className="ml-auto text-green-500 font-black text-[9px] tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_green]"></div>
                LIVE FEED
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">
              {drama.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-500">
               <span className="flex items-center gap-2 text-red-600">
                <span className="text-xl">★</span> {drama.rating.toFixed(1)}
               </span>
               <span className="border-l border-zinc-800 pl-8">{drama.releaseYear}</span>
               <span className="border-l border-zinc-800 pl-8">{drama.episodes} EPISODE</span>
               <span className="bg-zinc-900 text-zinc-400 px-4 py-1.5 rounded-md text-[9px] border border-zinc-800 italic">
                  STATUS: {drama.status}
               </span>
            </div>
          </div>

          <div className="space-y-8 bg-zinc-950/40 p-8 rounded-[2.5rem] border border-zinc-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-zinc-900 pb-6">
              <div className="relative inline-block">
                <select 
                  value={activeSeason}
                  onChange={(e) => setActiveSeason(parseInt(e.target.value))}
                  className="bg-zinc-900 text-white font-black text-xs uppercase tracking-[0.2em] px-10 py-4 rounded-xl border border-zinc-800 appearance-none hover:border-red-600 transition-all focus:outline-none cursor-pointer pr-16"
                >
                  {seasonList.map(s => <option key={s} value={s}>Musim {s}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-red-600">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
              <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest italic">Memuat Episode {startIdx + 1} - {endIdx}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {currentSeasonEpisodes.map((epNum) => {
                const isActive = activeChapter === epNum;
                return (
                  <button 
                    key={epNum} 
                    onClick={() => handleChapterSelect(epNum)}
                    className={`group relative py-6 rounded-2xl flex flex-col items-center justify-center font-black transition-all border overflow-hidden ${
                      isActive 
                        ? 'bg-red-600 text-white border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' 
                        : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-red-600/50 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-widest opacity-40 mb-1">EP</span>
                    <span className="relative z-10 text-xl">{epNum}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-zinc-950 p-10 rounded-[3rem] border border-zinc-900 relative group overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-red-600 opacity-20"></div>
              <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.5em] mb-8 flex items-center gap-3 italic">
                 SINOPSIS <span className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_red]"></span>
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium italic opacity-70 group-hover:opacity-100 transition-opacity">
                {drama.description}
              </p>
           </div>

           <div className="bg-zinc-900/10 p-8 rounded-[2.5rem] border border-zinc-900/40 space-y-4">
              <h4 className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">ENKRIPSI DATA</h4>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-zinc-700">Format</span>
                    <span className="text-zinc-300">STREAMING_MP4</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-zinc-700">Bitrate</span>
                    <span className="text-green-500">ULTRA_HD</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DramaDetails;
