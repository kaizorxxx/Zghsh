
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDetail, getWatch, search } from '../services/api'; // search added for recommendations
import { AnimeDetail, UserProfile, StreamingServer, DownloadLink, AnimeItem } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import CommentsSection from '../components/CommentsSection';
import AnimeCard from '../components/DramaCard';
import { firebaseService as supabase } from '../services/firebase';
import { getEpisodeNumber } from '../utils-episode';

interface AnimeDetailsProps {
  user: UserProfile;
}

const AnimeDetails: React.FC<AnimeDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [sortedEpisodes, setSortedEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<AnimeItem[]>([]);
  
  const [activeEpSlug, setActiveEpSlug] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [servers, setServers] = useState<StreamingServer[]>([]);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [currentServerName, setCurrentServerName] = useState<string | null>(null);

  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);
  const [mediaTab, setMediaTab] = useState<'stream' | 'download'>('stream');
  
  // Auto-play States
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [showFinishOverlay, setShowFinishOverlay] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [nextEp, setNextEp] = useState<any>(null);

  // Ads & Direct Link
  const adsConfig = supabase.getAds();
  const [directLinkTriggered, setDirectLinkTriggered] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadAnimeData = async () => {
      setLoading(true);
      try {
        const res = await getDetail(id);
        if (res && res.data) {
           setAnime(res.data);
           
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

           // Load Recommendations based on first genre
           if (res.data.info.genres && res.data.info.genres.length > 0) {
               const genre = res.data.info.genres[0];
               const recRes = await search(genre); // Simple search by genre
               if (recRes.data.anime) {
                   setRecommendations(recRes.data.anime.slice(0, 5));
               }
           }
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
    // Direct Link / Pop-under Logic
    if (adsConfig.directLinkEnabled && adsConfig.directLinkUrl && !directLinkTriggered) {
        window.open(adsConfig.directLinkUrl, '_blank');
        setDirectLinkTriggered(true);
        supabase.incrementAdClick();
        return; // Don't play yet, require second click
    }

    if (activeEpSlug === epSlug) return;
    
    setActiveEpSlug(epSlug);
    setStreamUrl(null); 
    setServers([]);
    setDownloadLinks([]);
    setCurrentServerName(null);
    setLoadingStream(true);
    setMediaTab('stream');
    setShowNextOverlay(false);
    setShowFinishOverlay(false);
    setNextEp(null);
    setCountdown(0);
    
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    try {
        const res = await getWatch(epSlug);
        const resServers = res?.data?.streaming_servers || [];
        if (resServers.length > 0) {
            setServers(resServers);
            const preferred = resServers.find(s => s.name.includes("P")) || resServers[0];
            setStreamUrl(preferred.url);
            setCurrentServerName(preferred.name);
        }
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
      if (currentIndex !== -1 && currentIndex < sortedEpisodes.length - 1) {
          const next = sortedEpisodes[currentIndex + 1];
          setNextEp(next);
          setCountdown(5);
          setShowNextOverlay(true);
      } else {
          setShowFinishOverlay(true);
      }
  };

  const cancelAutoPlay = () => {
      setShowNextOverlay(false);
      setNextEp(null);
  };

  useEffect(() => {
      if (!showNextOverlay || !nextEp) return;
      if (countdown > 0) {
          const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
          return () => clearTimeout(timer);
      } else {
          handleEpSelect(nextEp.slug);
      }
  }, [showNextOverlay, countdown, nextEp]);

  const currentIndex = sortedEpisodes.findIndex(ep => ep.slug === activeEpSlug);
  const prevEp = currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : null;
  const nextEpBtn = currentIndex !== -1 && currentIndex < sortedEpisodes.length - 1 ? sortedEpisodes[currentIndex + 1] : null;

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

  // Construct Player Overlay
  let overlayContent = null;
  if (loadingStream) {
      overlayContent = <div className="text-red-500 font-bold tracking-widest animate-pulse">MENCARI LINK...</div>;
  } else if (showNextOverlay && nextEp) {
      const epNum = getEpisodeNumber(nextEp.slug);
      overlayContent = (
          <div className="bg-zinc-950/90 backdrop-blur-xl border border-red-600/30 p-8 rounded-3xl flex flex-col items-center gap-6 max-w-sm w-full mx-4 shadow-[0_0_100px_rgba(220,38,38,0.2)] animate-fadeIn">
              <h3 className="text-2xl font-black font-orbitron text-white italic tracking-tighter">NEURAL <span className="text-red-600">LINK</span> READY</h3>
              <div className="relative w-24 h-24 flex items-center justify-center">
                   <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#27272a" strokeWidth="6" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#dc2626" strokeWidth="6" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * countdown) / 5} strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
                   </svg>
                   <span className="text-4xl font-black text-white font-orbitron">{countdown}</span>
              </div>
              <div className="text-center space-y-1">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Playing Next</p>
                  <p className="text-lg font-bold text-white uppercase tracking-tight">Episode {epNum}</p>
              </div>
              <div className="flex gap-3 w-full">
                  <button onClick={cancelAutoPlay} className="flex-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all">Cancel</button>
                  <button onClick={() => handleEpSelect(nextEp.slug)} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/20">Play Now</button>
              </div>
          </div>
      );
  } else if (showFinishOverlay) {
      overlayContent = (
          <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col items-center gap-6 max-w-sm w-full mx-4 shadow-2xl animate-fadeIn">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="text-center space-y-2">
                  <h3 className="text-xl font-black font-orbitron text-white uppercase tracking-wider">Series Complete</h3>
              </div>
              <div className="flex gap-3 w-full">
                  <button onClick={() => setShowFinishOverlay(false)} className="flex-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all">Close</button>
                  <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-[10px] uppercase tracking-widest transition-all">Home</button>
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
          overlay={overlayContent}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
            <button onClick={() => prevEp && handleEpSelect(prevEp.slug)} disabled={!prevEp} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${prevEp ? 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 hover:border-red-600/50' : 'bg-zinc-950 text-zinc-700 border border-zinc-900 cursor-not-allowed'}`}>
            Episode Sebelumnya
            </button>
            <button onClick={() => nextEpBtn && handleEpSelect(nextEpBtn.slug)} disabled={!nextEpBtn} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${nextEpBtn ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20' : 'bg-zinc-950 text-zinc-700 border border-zinc-900 cursor-not-allowed'}`}>
            Episode Selanjutnya
            </button>
        </div>
        
        {(servers.length > 0 || downloadLinks.length > 0) && (
            <div className="glass p-1.5 rounded-[2rem] border-white/5 space-y-4">
                <div className="flex bg-black/40 rounded-[1.8rem] p-1.5">
                    <button onClick={() => setMediaTab('stream')} className={`flex-1 py-3 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${mediaTab === 'stream' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-zinc-500 hover:text-white'}`}>Neural Stream</button>
                    {downloadLinks.length > 0 && (
                        <button onClick={() => setMediaTab('download')} className={`flex-1 py-3 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all ${mediaTab === 'download' ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]' : 'text-zinc-500 hover:text-white'}`}>Data Download</button>
                    )}
                </div>

                {mediaTab === 'stream' && (
                    <div className="p-4 sm:p-6 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-4">
                             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available Nodes</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {servers.map((server) => (
                                <button key={server.name} onClick={() => handleServerSelect(server)} className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${currentServerName === server.name ? 'bg-red-600 text-white' : 'bg-zinc-900/80 text-zinc-500 border border-zinc-800'}`}>{server.name}</button>
                            ))}
                        </div>
                    </div>
                )}
                {mediaTab === 'download' && (
                    <div className="p-4 sm:p-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {downloadLinks.map((linkGroup, idx) => (
                                <div key={idx} className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${(linkGroup.quality || '').includes('1080') ? 'bg-fuchsia-500' : 'bg-cyan-500'}`}></span>
                                        <span className="text-white font-bold font-orbitron text-xs tracking-wider">{linkGroup.quality}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(linkGroup.links || []).map((link, lIdx) => (
                                            <a key={lIdx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-black hover:bg-cyan-600 border border-zinc-800 text-zinc-400 hover:text-white text-[9px] font-black py-2.5 rounded-lg transition-colors uppercase tracking-widest">{link.provider}</a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="glass p-8 rounded-[3rem] border-white/5">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-orbitron font-black text-white uppercase italic tracking-tighter">Pilih Episode</h3>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full">{sortedEpisodes.length} Episodes</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {sortedEpisodes.map((ep) => {
                const epNum = getEpisodeNumber(ep.slug) || '?';
                const isActive = activeEpSlug === ep.slug;
                return (
                    <button key={ep.slug} onClick={() => handleEpSelect(ep.slug)} className={`py-3 rounded-xl font-black text-sm relative overflow-hidden group transition-all ${isActive ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] scale-105 z-10' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>{epNum}</button>
                );
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
              <div>
                  <h1 className="text-4xl md:text-5xl font-black font-orbitron text-white uppercase italic tracking-tighter mb-4 leading-none">{anime.title}</h1>
                  <div className="flex flex-wrap gap-3">
                      {genres.map(g => (
                          <span key={g} className="px-3 py-1 rounded-full border border-zinc-700 text-[10px] font-bold text-zinc-400 uppercase tracking-widest cursor-default">{g}</span>
                      ))}
                  </div>
              </div>
              
              <div className="glass p-8 rounded-[2rem] border-white/5 space-y-4">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="w-1.5 h-6 bg-red-600 rounded-full"></span>Sinopsis</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">{anime.synopsis}</p>
              </div>

              {/* COMMENTS & RATING */}
              <CommentsSection animeSlug={id || ''} user={user} onAuthReq={() => alert("Silakan login untuk mengakses fitur ini.")} />
          </div>

          <div className="space-y-6">
              <div className="glass p-6 rounded-[2rem] border-white/5 space-y-6">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mb-6 group">
                      <img src={anime.thumbnail} className="w-full h-full object-cover" alt={anime.title} />
                      <button onClick={toggleFav} className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600 hover:border-red-600 transition-all group-hover:scale-110 shadow-lg">
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

              {/* RECOMMENDED FOR YOU */}
              {recommendations.length > 0 && (
                  <div className="space-y-4">
                      <h3 className="font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-cyan-400 rounded-full"></span>
                          Rekomendasi
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                          {recommendations.map((rec, i) => (
                              <AnimeCard key={i} drama={rec} />
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
