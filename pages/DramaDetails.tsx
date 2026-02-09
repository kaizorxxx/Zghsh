
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetail, getWatch } from '../services/api';
import { AnimeDetail, UserProfile, StreamingServer, DownloadLink } from '../types';
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
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
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
           const rawEpisodes = res.data.episodes || [];
           const eps = [...rawEpisodes].sort((a, b) => {
               const numA = parseInt(getEpisodeNumber(a.slug) || '0');
               const numB = parseInt(getEpisodeNumber(b.slug) || '0');
               return numA - numB;
           });
           setSortedEpisodes(eps);

           const userFavs = user?.favorites || [];
           setIsFavorited(userFavs.includes(id));
           supabase.addToHistory(id);
        }
      } catch (err) {
        console.error("Failed to load details", err);
      } finally {
        setLoading(false);
      }
    };
    loadAnimeData();
  }, [id, user]);

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
    setDownloadLinks([]);
    setCurrentServerName(null);
    setLoadingStream(true);
    
    // Scroll to player
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    try {
        const res = await getWatch(epSlug);
        
        // Handle Streaming Servers
        const resServers = res?.data?.streaming_servers || [];
        if (resServers.length > 0) {
            setServers(resServers);
            
            // Prefer "P" server or first available
            const preferred = resServers.find(s => s.name.includes("P")) || resServers[0];
            setStreamUrl(preferred.url);
            setCurrentServerName(preferred.name);
        } else {
            console.warn("No streams found");
        }

        // Handle Download Links
        const resDownloads = res?.data?.download_links || [];
        if (resDownloads.length > 0) {
            setDownloadLinks(resDownloads);
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
          handleEpSelect(nextEp.slug);
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

  const infoEntries = anime.info ? Object.entries(anime.info) : [];
  const genres = anime.info?.genres || [];

  return (
    <div className="space-y-12 animate-fadeInUp" ref={playerRef}>
      <VideoPlayer 
          poster={anime.thumbnail} 
          streamUrl={streamUrl} 
          onEnded={handleVideoEnded}
          overlay={loadingStream ? <div className="text-red-500 font-bold tracking-widest animate-pulse">MENCARI LINK...</div> : null}
      />

      <div className="space-y-6">
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
        
        {servers.length > 0 && (
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">
                    Neural Uplink (Server):
                </span>
                <div className="flex flex-wrap gap-2">
                    {servers.map((server) => (
                        <button
                            key={server.name}
                            onClick={() => handleServerSelect(server)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                currentServerName === server.name 
                                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                                : 'bg-black text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600'
                            }`}
                        >
                            {server.name}
                        </button>
                    ))}
                </div>
             </div>
        )}

        {downloadLinks.length > 0 && (
            <div className="bg-zinc-900/30 p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {downloadLinks.map((linkGroup, idx) => (
                        <div key={idx} className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-red-600/30 transition-colors">
                            <div className="mb-3 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${(linkGroup.quality || '').includes('1080') ? 'bg-red-500' : 'bg-cyan-500'}`}></span>
                                <span className="text-white font-bold font-orbitron text-sm">{linkGroup.quality}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(linkGroup.links || []).map((link, lIdx) => (
                                    <a 
                                        key={lIdx} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
                                    >
                                        {link.provider}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div className="glass p-8 rounded-[3rem] border-white/5">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-orbitron font-black text-white uppercase italic tracking-tighter">
                Pilih Episode
            </h3>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full">
                {sortedEpisodes.length} Episodes
            </span>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {sortedEpisodes.map((ep) => {
                const epNum = getEpisodeNumber(ep.slug) || '?';
                const isActive = activeEpSlug === ep.slug;
                
                return (
                    <button
                        key={ep.slug}
                        onClick={() => handleEpSelect(ep.slug)}
                        className={`py-3 rounded-xl font-black text-sm relative overflow-hidden group transition-all ${
                            isActive 
                            ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] scale-105 z-10' 
                            : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                    >
                        {isActive && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>}
                        {epNum}
                    </button>
                );
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
              <div>
                  <h1 className="text-4xl md:text-5xl font-black font-orbitron text-white uppercase italic tracking-tighter mb-4 leading-none">
                      {anime.title}
                  </h1>
                  <div className="flex flex-wrap gap-3">
                      {genres.map(g => (
                          <span key={g} className="px-3 py-1 rounded-full border border-zinc-700 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:border-red-600 hover:text-white transition-colors cursor-default">
                              {g}
                          </span>
                      ))}
                  </div>
              </div>
              
              <div className="glass p-8 rounded-[2rem] border-white/5 space-y-4">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                      Sinopsis
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                      {anime.synopsis}
                  </p>
              </div>
          </div>

          <div className="space-y-6">
              <div className="glass p-6 rounded-[2rem] border-white/5 space-y-6">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mb-6 group">
                      <img src={anime.thumbnail} className="w-full h-full object-cover" alt={anime.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                      <button 
                        onClick={toggleFav}
                        className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-600 transition-all group-hover:scale-110 shadow-lg"
                      >
                         <svg className={`w-6 h-6 ${isFavorited ? 'text-white fill-current' : 'text-white'}`} fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </button>
                  </div>

                  <div className="space-y-4">
                      {infoEntries.map(([key, value]) => {
                          if (key === 'genres' || !value) return null;
                          return (
                              <div key={key} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0">
                                  <span className="text-zinc-500 font-bold uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                                  <span className="text-zinc-300 font-medium text-right max-w-[50%] truncate">{value.toString()}</span>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
