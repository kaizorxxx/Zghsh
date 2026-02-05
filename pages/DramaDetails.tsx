
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { fetchAnimeDetail, getAnimeVideo, fetchAnimeRecommended } from '../services/api';
import { Anime, UserProfile, Season } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import AnimeCard from '../components/DramaCard';
import { supabase } from '../services/supabase';

interface AnimeDetailsProps {
  user: UserProfile;
}

const AnimeDetails: React.FC<AnimeDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  const [anime, setAnime] = useState<Anime | null>(location.state?.drama || null);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(!anime);
  
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [activeEp, setActiveEp] = useState(1);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadAnimeData = async () => {
      setLoading(true);
      const detail = !anime ? await fetchAnimeDetail(id) : anime;
      const recs = await fetchAnimeRecommended();
      
      if (detail) {
        setAnime(detail);
        setIsFavorited(user.favorites.includes(detail.id));
        supabase.addToHistory(detail.id);
        
        if (detail.seasons && detail.seasons.length > 0) {
          setCurrentSeason(detail.seasons[0]);
        }
      }
      setRecommendations(recs);
      setLoading(false);

      const stream = await getAnimeVideo(id, 1);
      setStreamUrl(stream);
    };
    loadAnimeData();
  }, [id]);

  const toggleFav = () => {
    if (anime) {
      supabase.toggleFavorite(anime.id);
      setIsFavorited(!isFavorited);
    }
  };

  const handleEpSelect = async (ep: number) => {
    setActiveEp(ep);
    setStreamUrl(null);
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
    const stream = await getAnimeVideo(anime!.id, ep);
    setStreamUrl(stream);
  };

  const handleSeasonSelect = (season: Season) => {
    setCurrentSeason(season);
    setShowSeasonDropdown(false);
    // Optional: reset to first episode of that season? 
    // Usually ep index is absolute in many APIs, but we handle it relative to season if needed.
  };

  if (loading || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-orbitron font-black text-red-600 tracking-widest animate-pulse">SYNCHRONIZING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fadeInUp" ref={playerRef}>
      <VideoPlayer poster={anime.thumbnail} streamUrl={streamUrl} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">{anime.title}</h1>
              <div className="flex items-center gap-6 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                <span className="text-red-600 bg-red-600/10 px-2 py-1 rounded">★ {anime.rating}</span>
                <span>{anime.releaseYear}</span>
                <span>{anime.episodes} Episodes</span>
                <span className="bg-white/5 px-4 py-1 rounded text-white border border-white/10">{anime.status}</span>
              </div>
            </div>
            
            <button 
              onClick={toggleFav}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${
                isFavorited ? 'bg-red-600 text-white' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isFavorited ? 'DI FAVORIT' : 'TAMBAH FAVORIT'}
            </button>
          </div>

          <div className="bg-zinc-950/80 backdrop-blur-md p-8 rounded-[3rem] border border-zinc-900 shadow-2xl space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Pilih Episode</h3>
              
              {/* Season Dropdown (Netflix Style) */}
              <div className="relative">
                <button 
                  onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                  className="bg-zinc-900 border border-zinc-800 text-white px-6 py-3 rounded-xl flex items-center gap-4 hover:border-red-600 transition-all min-w-[160px] justify-between group"
                >
                  <span className="font-black text-[11px] uppercase tracking-widest">{currentSeason?.name || 'Musim'}</span>
                  <svg className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${showSeasonDropdown ? 'rotate-180 text-red-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                {showSeasonDropdown && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden z-[60] shadow-2xl animate-fadeInUp">
                    {anime.seasons?.map(s => (
                      <button 
                        key={s.number}
                        onClick={() => handleSeasonSelect(s)}
                        className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-colors border-b border-zinc-800 last:border-0 hover:bg-red-600 hover:text-white ${currentSeason?.number === s.number ? 'bg-zinc-800 text-red-500' : 'text-zinc-400'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Episode Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {currentSeason && Array.from({ length: currentSeason.episodeCount }, (_, i) => {
                // Kalkulasi nomor episode absolut jika diperlukan
                // Di sini kita asumsikan per season (Misal Season 2 mulai dari Ep 13)
                const offset = anime.seasons ? anime.seasons.slice(0, currentSeason.number - 1).reduce((acc, s) => acc + s.episodeCount, 0) : 0;
                const absoluteEp = offset + i + 1;
                
                return (
                  <button 
                    key={absoluteEp}
                    onClick={() => handleEpSelect(absoluteEp)}
                    className={`aspect-square rounded-2xl font-black text-sm flex items-center justify-center transition-all border-2 ${
                      activeEp === absoluteEp 
                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-110 z-10' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-red-600/50 hover:text-white'
                    }`}
                  >
                    {absoluteEp}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-zinc-950/50 p-8 rounded-[2rem] border border-white/5 h-fit shadow-xl group">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-red-600 rounded-full group-hover:h-8 transition-all"></div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">SINOPSIS</h4>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">{anime.description}</p>
          </div>

          <div className="bg-zinc-950/30 p-8 rounded-[2rem] border border-white/5 flex flex-col gap-4">
             <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <span>Source</span>
                <span className="text-red-500">{anime.source}</span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <span>Genre</span>
                <span className="text-white text-right">{anime.genre.slice(0, 2).join(', ')}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Dynamic Recommendation Section */}
      <section className="pt-20 border-t border-white/5 space-y-10">
        <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Mungkin Kamu Suka</h2>
            <div className="h-[2px] flex-grow bg-gradient-to-r from-red-600 to-transparent"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {recommendations.slice(0, 12).map(item => (
            <AnimeCard key={item.id} drama={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnimeDetails;
