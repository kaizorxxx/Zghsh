
import { Drama } from '../types';

/**
 * REBAHIN21 CORE CONFIGURATION
 */
const API_BASE = 'https://zeldvorik.ru/rebahin21/api.php';

const FALLBACK_DATA: Drama[] = [
  { id: 'f1', title: 'Cyberpunk Edgerunners', thumbnail: 'https://picsum.photos/seed/cyber/800/1200', description: 'In a dystopia riddled with corruption and cybernetic implants, a street kid tries to survive as an edgerunner.', rating: 9.8, source: 'Rebahin21', genre: ['Anime', 'Sci-Fi'], releaseYear: 2022, status: 'Completed', episodes: 10 },
  { id: 'f2', title: 'Neon Dynasty', thumbnail: 'https://picsum.photos/seed/neon/800/1200', description: 'Dynastic power struggles in the floating city.', rating: 9.2, source: 'Rebahin21', genre: ['Cyberpunk'], releaseYear: 2077, status: 'Ongoing', episodes: 50 }
];

/**
 * Normalizes Rebahin21 data into our standard Drama interface.
 * Strictly maps titles and thumbnails to ensure no 'Untitled Content' or broken images.
 */
const mapToDrama = (item: any): Drama => {
  // 1. Precise Title Extraction
  const title = 
    item.title || 
    item.name || 
    item.movie_title || 
    item.movie_name || 
    item.label || 
    item.judul || 
    'Transmisi #' + (item.id || item.movie_id || 'Unknown');

  // 2. High-Quality Thumbnail Resolver
  const thumbnail = 
    item.poster || 
    item.thumb || 
    item.image || 
    item.cover || 
    item.thumbnail ||
    (item.movie_id ? `https://picsum.photos/seed/${item.movie_id}/800/1200` : `https://picsum.photos/seed/${title}/800/1200`);

  // 3. Season & Episode Logic
  // Rebahin often includes episode counts or season info in meta strings
  const episodes = parseInt(item.episodes) || (item.total_chapters ? parseInt(item.total_chapters) : 0);
  
  return {
    id: String(item.id || item.movie_id || Math.random().toString(36).substr(2, 9)),
    title: title.trim(),
    thumbnail: thumbnail,
    description: item.description || item.plot || item.intro || item.synopsis || 'Data sinopsis sedang dienkripsi. Informasi tidak tersedia saat ini.',
    rating: parseFloat(item.rating) || 8.5,
    episodes: episodes || 1,
    genre: item.genres ? (Array.isArray(item.genres) ? item.genres : item.genres.split(',').map((s: string) => s.trim())) : (item.tags ? (typeof item.tags === 'string' ? item.tags.split(',') : item.tags) : ['General']),
    releaseYear: parseInt(item.year) || new Date().getFullYear(),
    status: (item.status === 'Completed' || item.is_finish || item.status === 'Ended') ? 'Completed' : 'Ongoing',
    source: 'Rebahin21'
  };
};

/**
 * Resilient fetcher for the API base.
 */
const secureFetch = async (query: string) => {
  try {
    const response = await fetch(`${API_BASE}?${query}`);
    if (!response.ok) throw new Error(`Uplink Error: ${response.status}`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Neural Fetch failed:", error);
    throw error;
  }
};

export const fetchPaginatedDramas = async (action: string, page: number = 1, searchQuery?: string): Promise<Drama[]> => {
  try {
    let query = `page=${page}`;
    
    if (searchQuery) {
      query += `&action=search&q=${encodeURIComponent(searchQuery)}`;
    } else {
      let apiAction = action.toLowerCase();
      if (action === 'Beranda') apiAction = 'home';
      if (action === 'Trending') apiAction = 'trending';
      if (action === 'Film') apiAction = 'movies';
      if (action === 'Serial') apiAction = 'series';
      if (action === 'Anime') apiAction = 'anime';
      query += `&action=${apiAction}`;
    }

    const data = await secureFetch(query);
    const list = Array.isArray(data) ? data : (data.data || data.list || data.items || []);
    
    if (list.length === 0 && page === 1 && !searchQuery) return FALLBACK_DATA;
    return list.map(mapToDrama);
  } catch (err) {
    return page === 1 ? FALLBACK_DATA : [];
  }
};

export const fetchRankings = async (): Promise<Drama[]> => {
  try {
    const data = await secureFetch('action=trending');
    const list = Array.isArray(data) ? data : (data.data || data.list || []);
    return list.slice(0, 10).map(mapToDrama);
  } catch (err) {
    return FALLBACK_DATA;
  }
};

export const fetchDramaById = async (id: string): Promise<Drama | undefined> => {
  try {
    const data = await secureFetch(`action=detail&id=${id}`);
    if (data) {
      // Some APIs return detail nested in data property
      const detail = data.data || data;
      return mapToDrama(detail);
    }
    return FALLBACK_DATA.find(d => d.id === id);
  } catch (e) {
    return FALLBACK_DATA.find(d => d.id === id);
  }
};

export const getVideoStream = async (id: string, index: number = 1): Promise<string | null> => {
  try {
    const json = await secureFetch(`action=watch&id=${id}&ep=${index}`);
    // Prioritize direct URL, then stream, then data nested URL
    return json.url || json.stream || json.data?.url || json.embed || null;
  } catch (e) {
    return null;
  }
};
