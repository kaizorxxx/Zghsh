
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetail, getWatch } from '../services/api';
import { AnimeDetail, UserProfile, StreamingServer } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import { supabase } from '../services/supabase';
import { getEpisodeNumber } from '../utils-episode';

interface AnimeDetailsProps {
  user: UserProfile;
}

const AnimeDetails: React.FC<AnimeDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>(); // This "id" is actually the slug
  const navigate = useNavigate();
  
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [sortedEpisodes, setSortedEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeEpSlug, setActiveEpSlug] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [servers, setServers] = useState<StreamingServer[]>([]);
  const [currentServerName, setCurrentServerName] = useState<string | null>(null);

  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadAnimeData = async () => {
      setLoading(true);
      try {
        const res = await getDetail(id);
        if (res && res.data) {
           setAnime(res.data);
           
           // Sort episodes by number (Ascending: 1, 2, 3...)
           const eps = res.data.episodes ? [...res.data.episodes].sort((a, b) => {
               const numA = parseInt(getEpisodeNumber(a.slug) || '0');
               const numB = parseInt(getEpisodeNumber(b.slug) || '0');
               return numA - numB;
           }) : [];
           setSortedEpisodes(eps);

           setIsFavorited(user.favorites.includes(id));
           supabase.addToHistory(id);
        }
      } catch (err) {
        console.error("Failed to load details", err);
      } finally {
        setLoading(false);
      }
    };
    loadAnimeData();
  }, [id]);

  const toggleFav = () => {
    if (id) {
      supabase.toggleFavorite(id);
      setIsFavorited(!isFavorited);
    }
  };

  const handleEpSelect = async (epSlug: string) => {
    if (activeEpSlug === epSlug) return;
    
    setActiveEpSlug(epSlug);
    setStreamUrl(null); 
    setServers([]);
    setCurrentServerName(null);
    setLoadingStream(true);
    
    // Scroll to player
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    try {
        const res = await getWatch(epSlug);
        if (res.data && res.data.streaming_servers && res.data.streaming_servers.length > 0) {
            setServers(res.data.streaming_servers);
            
            // Prefer "P" server or first available
            const preferred = res.data.streaming_servers.find(s => s.name.includes("P")) || res.data.streaming_servers[0];
            setStreamUrl(preferred.url);
            setCurrentServerName(preferred.name);
        } else {
            console.warn("No streams found");
        }
    } catch (err) {
        console.error("Stream uplink failed", err);
    } finally {
        setLoadingStream(false);
    }
  };

  const handleServerSelect = (server: StreamingServer) => {
      setStreamUrl(server.url);
      setCurrentServerName(server.name);
  };

  const handleVideoEnded = () => {
      if (!activeEpSlug || sortedEpisodes.length === 0) return;

      const currentIndex = sortedEpisodes.findIndex(ep => ep.slug === activeEpSlug);
      
      // If there is a next episode in the sorted list
      if (currentIndex !== -1 && currentIndex < sortedEpisodes.length - 1) {
          const nextEp = sortedEpisodes[currentIndex + 1];
          console.log("Autoplaying next episode:", nextEp.title);
          handleEpSelect(nextEp.slug);
      } else {
          console.log("Series finished or no next episode.");
      }
  };

  const currentIndex = sortedEpisodes.findIndex(ep => ep.slug === activeEpSlug);
  const prevEp = currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : null;
  const nextEp = currentIndex !== -1 && currentIndex < sortedEpisodes.length - 1 ? sortedEpisodes[currentIndex + 1] : null;

  if (loading || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(220,38,38,0.5)]"></div>
          <p className="font-orbitron font-black text-red-600 tracking-widest animate-pulse italic uppercase">Menghubungkan Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeInUp" ref={playerRef}>
      <VideoPlayer 
          poster={anime.thumbnail} 
          streamUrl={streamUrl} 
          onEnded={handleVideoEnded}
          overlay={loadingStream ? <div className="text-red-500 font-bold tracking-widest animate-pulse">MENCARI LINK...</div> : null}
      />

      {/* Video Controls & Info */}
      <div className="space-y-6">
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
            <button
            onClick={() => prevEp && handleEpSelect(prevEp.slug)}
            disabled={!prevEp}
            className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                prevEp 
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-red-600/50' 
                : 'bg-zinc-950 text-zinc-700 border border-zinc-900 cursor-not-allowed'
            }`}
            >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Episode Sebelumnya
            </button>

            <button
            onClick={() => nextEp && handleEpSelect(nextEp.slug)}
            disabled={!nextEp}
            className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                nextEp 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20' 
                : 'bg-zinc-950 text-zinc-700 border border-zinc-900 cursor-not-allowed'
            }`}
            >
            Episode Selanjutnya
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
        
        {/* Server Selection */}
        {servers.length > 0 && (
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 text-zinc-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">PILIH SERVER:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {servers.map((server) => (
                          <button
                              key={server.name}
                              onClick={() => handleServerSelect(server)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                  currentServerName === server.name
                                      ? 'bg-red-600 text-white border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                                      : 'bg-black text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                              }`}
                          >
                              {server.name}
                          </button>
                      ))}
                  </div>
             </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg leading-tight">{anime.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                <span className="text-red-600 bg-red-600/10 px-2 py-1 rounded border border-red-600/20">{anime.info.status}</span>
                <span>{anime.info.durasi}</span>
                <span>{anime.info.tipe}</span>
                <span className="bg-white/5 px-4 py-1 rounded text-white border border-white/10 uppercase tracking-widest text-[9px]">{anime.info.studio}</span>
              </div>
            </div>
            
            <button 
              onClick={toggleFav}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 border ${
                isFavorited ? 'bg-red-600 text-white border-red-500 animate-glowPulse' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isFavorited ? 'TERSIMPAN' : 'SIMPAN KE FAVORIT'}
            </button>
          </div>

          <div className="bg-zinc-950/80 backdrop-blur-md p-8 rounded-[3rem] border border-zinc-900 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                Daftar Episode
              </h3>
            </div>

            {/* Episode Grid (Reversed or normal based on sortedEpisodes) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 relative z-10">
              {sortedEpisodes.map((ep) => (
                <button 
                    key={ep.slug}
                    onClick={() => handleEpSelect(ep.slug)}
                    className={`px-4 py-3 rounded-xl font-black text-[10px] flex items-center justify-between transition-all border relative group/ep ${
                      activeEpSlug === ep.slug
                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] z-10 animate-glowPulse' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-red-600/50 hover:text-white hover:scale-105'
                    }`}
                  >
                    <span className="truncate max-w-[80%]">{ep.title.replace(anime.title, '').replace(/Episode\s+/i, 'Ep ').trim() || ep.episode}</span>
                    {activeEpSlug === ep.slug && (
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    )}
                  </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-zinc-950/50 p-8 rounded-[2rem] border border-white/5 h-fit shadow-xl group hover:border-red-600/20 transition-all">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-red-600 rounded-full group-hover:h-8 transition-all"></div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">SINOPSIS</h4>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                {anime.synopsis || 'Tidak ada data ditemukan di catatan neural.'}
            </p>
          </div>

          <div className="bg-zinc-950/30 p-8 rounded-[2rem] border border-white/5 flex flex-col gap-4">
             <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <span>Diperbarui</span>
                <span className="text-red-500 text-right">{anime.info.diperbarui_pada}</span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <span>Genre</span>
                <span className="text-white text-right">{(anime.info.genres || []).slice(0, 3).join(' • ')}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
