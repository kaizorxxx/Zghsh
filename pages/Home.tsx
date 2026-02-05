
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchLatestAnime, fetchAnimeRecommended, searchAnime } from '../services/api';
import { Anime } from '../types';
import AnimeCard from '../components/DramaCard';

const Home: React.FC = () => {
  const [latest, setLatest] = useState<Anime[]>([]);
  const [recommended, setRecommended] = useState<Anime[]>([]);
  const [searchResults, setSearchResults] = useState<Anime[] | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');

  useEffect(() => {
    const loadHome = async () => {
      setLoading(true);
      if (query) {
        const results = await searchAnime(query);
        setSearchResults(results);
      } else {
        setSearchResults(null);
        const [lat, rec] = await Promise.all([
          fetchLatestAnime(1),
          fetchAnimeRecommended()
        ]);
        setLatest(lat);
        setRecommended(rec);
      }
      setLoading(false);
    };
    loadHome();
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (searchResults) {
    return (
      <div className="space-y-10 pb-20">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Hasil Pencarian: "{query}"</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {searchResults.map(anime => <AnimeCard key={anime.id} drama={anime} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Featured Hero (Netflix Style) */}
      {recommended.length > 0 && (
        <section className="relative h-[70vh] rounded-[3rem] overflow-hidden group shadow-2xl">
          <img src={recommended[0].thumbnail} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Featured" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          <div className="absolute bottom-20 left-12 max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded">FEATURED</span>
              <span className="text-white font-bold text-xs uppercase tracking-widest">Rekomendasi AI Pekan Ini</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter italic drop-shadow-2xl">
              {recommended[0].title}
            </h1>
            <p className="text-zinc-300 text-lg line-clamp-3 font-medium opacity-80 italic">
              {recommended[0].description}
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-black px-12 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl">Putar Sekarang</button>
              <button className="bg-white/10 backdrop-blur-md text-white px-12 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all border border-white/10">+ Simpan</button>
            </div>
          </div>
        </section>
      )}

      {/* Row: Recommended (Horizontal Scroll) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Populer di Sansekai</h2>
          <button className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline">Lihat Semua</button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar">
          {recommended.map(anime => (
            <div key={anime.id} className="min-w-[220px] max-w-[220px]">
              <AnimeCard drama={anime} />
            </div>
          ))}
        </div>
      </section>

      {/* Row: Latest Uploads */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Update Terbaru</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {latest.map(anime => <AnimeCard key={anime.id} drama={anime} />)}
        </div>
      </section>
    </div>
  );
};

export default Home;
