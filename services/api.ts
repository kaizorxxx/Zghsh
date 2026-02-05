
import { Anime, Season } from '../types';
import { FALLBACK_ANIME } from '../constants';

const BASE_URL = 'https://api.sansekai.my.id';
// Optional: Use a public CORS proxy if direct fetch fails (use with caution)
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const generateSeasons = (totalEpisodes: number): Season[] => {
  if (totalEpisodes <= 0) return [{ number: 1, name: 'Season 1', episodeCount: 12 }];
  if (totalEpisodes <= 13) return [{ number: 1, name: 'Season 1', episodeCount: totalEpisodes }];
  
  const seasons: Season[] = [];
  let remaining = totalEpisodes;
  let count = 1;
  
  while (remaining > 0) {
    const epInSeason = remaining > 12 ? 12 : remaining;
    seasons.push({
      number: count,
      name: `Season ${count}`,
      episodeCount: epInSeason
    });
    remaining -= epInSeason;
    count++;
  }
  return seasons;
};

const mapToAnime = (item: any): Anime => {
  const episodes = parseInt(item.episodes) || 0;
  
  let genreList: string[] = ['Anime'];
  if (Array.isArray(item.genres)) {
    genreList = item.genres;
  } else if (typeof item.genres === 'string') {
    genreList = item.genres.split(',').map((g: string) => g.trim());
  } else if (typeof item.genre === 'string') {
    genreList = item.genre.split(',').map((g: string) => g.trim());
  }

  return {
    id: String(item.id || item.anime_id || item.mal_id || Math.random()),
    title: item.title || item.name || item.judul || 'Untitled Anime',
    thumbnail: item.thumbnail || item.poster || item.image || item.thumb || `https://placehold.co/600x800/000000/FFFFFF/png?text=No+Image`,
    description: item.description || item.synopsis || item.desc || 'Deskripsi tidak tersedia untuk anime ini.',
    rating: parseFloat(item.rating || item.score) || 0.0,
    episodes: episodes,
    genre: genreList,
    releaseYear: parseInt(item.year || item.release_date) || 2024,
    status: item.status || 'Ongoing',
    source: 'Sansekai',
    seasons: generateSeasons(episodes)
  };
};

const extractListData = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && data.data && Array.isArray(data.data.data)) return data.data.data;
  if (data && data.results && Array.isArray(data.results)) return data.results;
  return [];
};

export const fetchLatestAnime = async (page: number = 1): Promise<Anime[]> => {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/anime/latest?page=${page}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    const list = extractListData(data);
    return list.length > 0 ? list.map(mapToAnime) : FALLBACK_ANIME;
  } catch (e) {
    console.warn("Fetch Latest failed, using Neural Cache fallback.");
    return FALLBACK_ANIME;
  }
};

export const searchAnime = async (query: string): Promise<Anime[]> => {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/anime/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search node unresponsive');
    const data = await res.json();
    const list = extractListData(data);
    return list.map(mapToAnime);
  } catch (e) {
    console.error("Search Error:", e);
    // Return partial matches from fallback if API fails
    return FALLBACK_ANIME.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));
  }
};

export const fetchAnimeRecommended = async (): Promise<Anime[]> => {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/anime/recommended`);
    if (!res.ok) throw new Error('Recommendation node offline');
    const data = await res.json();
    const list = extractListData(data);
    // Mix real and mock for better aesthetics
    const real = list.map(mapToAnime);
    return real.length > 0 ? [...real, ...FALLBACK_ANIME.slice(0, 3)] : FALLBACK_ANIME;
  } catch (e) {
    console.warn("Fetch Recommended failed, using Neural Cache.");
    return FALLBACK_ANIME;
  }
};

export const fetchAnimeDetail = async (id: string): Promise<Anime | null> => {
  // Check if it's a mock ID first
  if (id.startsWith('mock_')) {
    return FALLBACK_ANIME.find(a => a.id === id) || null;
  }

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/anime/detail?id=${id}`);
    if (!res.ok) throw new Error('Detail node offline');
    const data = await res.json();
    const item = data.data || data;
    if (!item || (typeof item === 'object' && Object.keys(item).length === 0)) return null;
    return mapToAnime(item);
  } catch (e) {
    console.error("Fetch Detail Error:", e);
    return null;
  }
};

export const getAnimeVideo = async (id: string, ep: number = 1): Promise<string | null> => {
  // Mock Video for testing if API fails
  if (id.startsWith('mock_')) {
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  }

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/anime/getvideo?id=${id}&ep=${ep}`);
    if (!res.ok) throw new Error('Stream node offline');
    const data = await res.json();
    return data.url || data.link || data.stream || data.data?.url || null;
  } catch (e) {
    console.error("Get Video Error:", e);
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; // Emergency fallback video
  }
};
