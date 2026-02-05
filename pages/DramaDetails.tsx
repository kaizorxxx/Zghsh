
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { fetchAnimeDetail, getAnimeVideo, fetchAnimeRecommended } from '../services/api';
import { Anime, UserProfile } from '../types';
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
  const [activeEp, setActiveEp] = useState(1);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadAnimeData = async () => {
      setLoading(true);
      const [detail, recs] = await Promise.all([
        !anime ? fetchAnimeDetail(id) : anime,
        fetchAnimeRecommended()
      ]);
      
      if (detail) {
        setAnime(detail);
        setIsFavorited(user.favorites.includes(detail.id));
        supabase.addToHistory(detail.id);
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

  if (loading || !anime) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 animate-pulse">CONNECTING...</div>;
  }

  return (
    <div className="space-y-12 animate-fadeInUp" ref={playerRef}>
      <VideoPlayer poster={anime.thumbnail} streamUrl={streamUrl} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">{anime.title}</h1>
              <div className="flex items-center gap-6 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                <span className="text-red-600">★ {anime.rating}</span>
                <span>{anime.releaseYear}</span>
                <span>{anime.episodes} Episodes</span>
                <span className="bg-white/5 px-4 py-1 rounded text-white">{anime.status}</span>
              </div>
            </div>
            <button 
              onClick={toggleFav}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest transition-all ${
                isFavorited ? 'bg-red-600 text-white shadow-xl' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isFavorited ? 'DI FAVORIT' : 'TAMBAH FAVORIT'}
            </button>
          </div>

          <div className="bg-zinc-950 p-8 rounded-[2rem] border border-zinc-900">
            <h3 className="text-lg font-black text-white uppercase italic mb-6">Pilih Episode</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {Array.from({ length: anime.episodes }, (_, i) => i + 1).map(ep => (
                <button 
                  key={ep}
                  onClick={() => handleEpSelect(ep)}
                  className={`py-4 rounded-xl font-black transition-all ${
                    activeEp === ep ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-600 hover:text-white'
                  }`}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/50 p-8 rounded-[2rem] border border-white/5 h-fit">
          <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-6">SINOPSIS</h4>
          <p className="text-zinc-400 text-sm leading-relaxed italic opacity-80">{anime.description}</p>
        </div>
      </div>

      {/* Dynamic Recommendation Section (Replacing complex footer parts) */}
      <section className="pt-20 border-t border-white/5 space-y-10">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Recommended For You</h2>
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
