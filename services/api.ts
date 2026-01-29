
import { Drama } from '../types';

/**
 * REBAHIN21 CORE CONFIGURATION
 */
const API_URL = 'https://zeldvorik.ru/rebahin21/api.php';

// List of CORS proxies (Priority based on stability for video streaming)
const PROXIES = [
  'https://api.allorigins.win/raw?url=', // Good for JSON
  'https://corsproxy.io/?',              // Good for raw data
  'https://thingproxy.freeboard.io/fetch/',
  '' // Direct fetch (rarely works for cross-origin but worth a try)
];

// MOCK DATA: Used when API completely fails (Network Dead / CORS hard block)
const FALLBACK_DATA: Drama[] = [
  { id: 'f1', title: 'Cyberpunk Edgerunners', thumbnail: 'https://picsum.photos/seed/cyber/800/1200', description: 'Di tengah distopia masa depan, seorang remaja jalanan berjuang bertahan hidup sebagai tentara bayaran edgerunner.', rating: 9.8, source: 'Rebahin21', genre: ['Anime', 'Sci-Fi'], releaseYear: 2022, status: 'Completed', episodes: 10 },
  { id: 'f2', title: 'Neon Dynasty', thumbnail: 'https://picsum.photos/seed/neon/800/1200', description: 'Perebutan kekuasaan dinasti di kota terapung masa depan.', rating: 9.2, source: 'Rebahin21', genre: ['Cyberpunk'], releaseYear: 2077, status: 'Ongoing', episodes: 50 },
  { id: 'f3', title: 'Altered Carbon: Resleeved', thumbnail: 'https://picsum.photos/seed/carbon/800/1200', description: 'Takeshi Kovacs harus melindungi seorang pembuat tato yakuza muda sambil menyelidiki kematian bos yakuza.', rating: 8.9, source: 'Rebahin21', genre: ['Anime', 'Sci-Fi'], releaseYear: 2020, status: 'Completed', episodes: 1 },
  { id: 'f4', title: 'Arcane', thumbnail: 'https://picsum.photos/seed/arcane/800/1200', description: 'Di tengah konflik antara kota kembar Piltover dan Zaun, dua saudara perempuan bertarung di sisi yang berlawanan.', rating: 9.9, source: 'Rebahin21', genre: ['Action', 'Fantasy'], releaseYear: 2021, status: 'Ongoing', episodes: 9 }
];

/**
 * Helper: Detect if string is a URL
 */
const isValidUrl = (urlString: string) => {
    try { 
    	return Boolean(new URL(urlString)); 
    }
    catch(e){ 
    	return false; 
    }
}

/**
 * Normalisasi data Rebahin21.
 */
const mapToDrama = (item: any): Drama => {
  const title = 
    item.title || 
    item.name || 
    item.movie_title || 
    item.movie_name || 
    item.judul || 
    item.nama || 
    item.label ||
    (item.id ? `Archive #${item.id}` : 'Arsip Tidak Terdeteksi');

  const thumbnail = 
    item.poster || 
    item.thumb || 
    item.image || 
    item.cover || 
    item.thumbnail ||
    item.img ||
    `https://picsum.photos/seed/${encodeURIComponent(title)}/800/1200`;

  const episodes = parseInt(item.episodes) || (item.total_chapters ? parseInt(item.total_chapters) : 1);
  
  return {
    id: String(item.id || item.movie_id || Math.random().toString(36).substr(2, 9)),
    title: String(title).trim(),
    thumbnail: thumbnail,
    description: item.description || item.plot || item.intro || item.synopsis || item.keterangan || 'Data sinopsis sedang dienkripsi. Informasi tidak tersedia saat ini karena gangguan jaringan.',
    rating: parseFloat(item.rating) || 8.5,
    episodes: episodes,
    genre: item.genres ? (Array.isArray(item.genres) ? item.genres : item.genres.split(',').map((s: string) => s.trim())) : (item.tags ? (typeof item.tags === 'string' ? item.tags.split(',') : item.tags) : ['Drama']),
    releaseYear: parseInt(item.year) || new Date().getFullYear(),
    status: (item.status === 'Completed' || item.is_finish || item.status === 'Ended') ? 'Completed' : 'Ongoing',
    source: 'Rebahin21'
  };
};

/**
 * Pengambil data dengan strategi multi-proxy & Timeout.
 */
const secureFetch = async (query: string) => {
  const timestamp = new Date().getTime();
  const targetUrl = `${API_URL}?${query}&_t=${timestamp}`;

  for (const proxyBase of PROXIES) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 detik timeout

    try {
      // Encode URL is crucial for proxies
      const fetchUrl = proxyBase ? `${proxyBase}${encodeURIComponent(targetUrl)}` : targetUrl;
      
      const response = await fetch(fetchUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) continue;
      
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        
        // Handle AllOrigins specific wrapper
        if (proxyBase.includes('allorigins') && json.contents) {
           try { return JSON.parse(json.contents); } catch { return json.contents; }
        }
        return json;
      } catch (e) {
        // If JSON parse fails, but we got text, maybe it's raw HTML (for embeds)?
        // For now, treat as failure and try next proxy
        console.warn(`JSON Parse failed for ${fetchUrl}`);
        continue;
      }
    } catch (error) {
      clearTimeout(timeoutId);
    }
  }
  return null;
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
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return page === 1 ? FALLBACK_DATA : [];
    }

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
    if (!data) return FALLBACK_DATA;
    const list = Array.isArray(data) ? data : (data.data || data.list || []);
    return list.slice(0, 10).map(mapToDrama);
  } catch (err) {
    return FALLBACK_DATA;
  }
};

export const fetchDramaById = async (id: string): Promise<Drama | undefined> => {
  try {
    const local = FALLBACK_DATA.find(d => d.id === id);
    if (local) return local;

    const data = await secureFetch(`action=detail&id=${id}`);
    if (data) {
      const detail = data.data || data;
      if (detail) return mapToDrama(detail);
    }
    return undefined;
  } catch (e) {
    return FALLBACK_DATA.find(d => d.id === id);
  }
};

/**
 * Mendapatkan URL streaming.
 * Mencoba mencari link MP4 direct, atau link Embed (Iframe).
 */
export const getVideoStream = async (id: string, index: number = 1): Promise<string | null> => {
  // 1. Cek Mock Data dulu (Untuk testing user experience tanpa backend nyata)
  if (id.startsWith('f')) {
      // Return a sample Big Buck Bunny / Tech demo stream for fallback items
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }

  try {
    const json = await secureFetch(`action=watch&id=${id}&ep=${index}`);
    
    if (!json) return null;

    // Prioritas pengambilan link video
    const link = 
        json.url || 
        json.stream || 
        json.data?.url || 
        json.embed || 
        json.iframe ||
        json.link;
    
    if (link && isValidUrl(link)) {
        return link;
    }
    return null;
  } catch (e) {
    console.error("Failed to fetch video stream", e);
    return null;
  }
};
