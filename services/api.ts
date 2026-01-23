
import { Drama } from '../types';

/**
 * SECURE GATEKEEPER CONFIGURATION
 * In a real production environment, these base URLs and keys would be 
 * strictly server-side (Next.js API Routes) to prevent client-side theft.
 */
const ENDPOINTS = {
  DRAMABOX: 'https://dramabos.asia/api/dramabox/api',
  MELOLO: 'https://dramabos.asia/api/melolo/api/v1'
};

// Simulated backend security headers to prevent unauthorized "scrapers"
const getSecureHeaders = () => ({
  'X-Nova-Signature': btoa(Date.now().toString()), // Mock signature
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Normalization Helpers
const mapDramaboxToDrama = (item: any): Drama => {
  let genres: string[] = ['C-Drama'];
  if (Array.isArray(item.tags)) genres = item.tags;
  else if (typeof item.tags === 'string' && item.tags.length > 0) genres = item.tags.split(',');

  return {
    id: String(item.book_id || item.id || ''),
    title: item.name || item.title || 'Untitled Transmission',
    thumbnail: item.cover || 'https://picsum.photos/seed/drama/800/1200',
    description: item.intro || item.description || 'Data missing in archive.',
    rating: parseFloat(item.score) || 9.0,
    episodes: item.total_chapters || 0,
    genre: genres,
    releaseYear: new Date().getFullYear(),
    status: item.is_finish ? 'Completed' : 'Ongoing',
    source: 'Dramabox'
  };
};

const mapMeloloToDrama = (item: any): Drama => {
  return {
    id: String(item.id || ''),
    title: item.title || 'Unknown Signal',
    thumbnail: item.poster || 'https://picsum.photos/seed/melolo/800/1200',
    description: item.description || 'Description encrypted.',
    rating: 8.5,
    episodes: item.video_count || 0,
    genre: ['Melolo Series'],
    releaseYear: 2024,
    status: 'Ongoing',
    source: 'Melolo'
  };
};

/**
 * SECURE BACKEND PROXY (Simulated)
 * This function handles the actual network requests. 
 * By centralizing it, we can easily swap it for a real Node.js proxy later.
 */
const secureFetch = async (url: string) => {
  const response = await fetch(url, { headers: getSecureHeaders() });
  if (!response.ok) throw new Error(`Uplink Failed: ${response.status}`);
  return response.json();
};

export const fetchPaginatedDramas = async (category: 'foryou' | 'new', page: number): Promise<Drama[]> => {
  try {
    // Attempt Dramabox Paginated Fetch
    const dbUrl = `${ENDPOINTS.DRAMABOX}/${category}/${page}?lang=in`;
    const dbJson = await secureFetch(dbUrl);
    
    if (dbJson.data && dbJson.data.list && dbJson.data.list.length > 0) {
      return dbJson.data.list.map(mapDramaboxToDrama);
    }
    
    // Fallback to Melolo Paginated (using offset)
    const meloloOffset = (page - 1) * 18;
    const mlUrl = `${ENDPOINTS.MELOLO}/home?offset=${meloloOffset}&count=18&lang=id`;
    const mlJson = await secureFetch(mlUrl);
    
    if (mlJson.data && mlJson.data.items) {
      return mlJson.data.items.map(mapMeloloToDrama);
    }

    return [];
  } catch (error) {
    console.error("Backend Proxy Error:", error);
    return [];
  }
};

export const fetchRankings = async (): Promise<Drama[]> => {
  try {
    const json = await secureFetch(`${ENDPOINTS.DRAMABOX}/rank/1?lang=in`);
    return json.data?.list?.map(mapDramaboxToDrama) || [];
  } catch (error) {
    return [];
  }
};

export const fetchDramaById = async (id: string, source: 'Dramabox' | 'Melolo'): Promise<Drama | undefined> => {
  try {
    if (source === 'Dramabox') {
      const dramaJson = await secureFetch(`${ENDPOINTS.DRAMABOX}/drama/${id}?lang=in`);
      const chaptersJson = await secureFetch(`${ENDPOINTS.DRAMABOX}/chapters/${id}?lang=in`);
      if (dramaJson.data) {
        return {
          ...mapDramaboxToDrama(dramaJson.data),
          chapters: chaptersJson.data?.list || []
        };
      }
    } else {
      const json = await secureFetch(`${ENDPOINTS.MELOLO}/detail/${id}?lang=id`);
      if (json.data) return mapMeloloToDrama(json.data);
    }
  } catch (e) { console.error(e); }
  return undefined;
};

export const getVideoStream = async (id: string, index: number, source: 'Dramabox' | 'Melolo'): Promise<string | null> => {
  try {
    const url = source === 'Dramabox' 
      ? `${ENDPOINTS.DRAMABOX}/watch/player?bookId=${id}&index=${index}&lang=in`
      : `${ENDPOINTS.MELOLO}/video/${id}?lang=id`;
    
    const json = await secureFetch(url);
    return source === 'Dramabox' ? json.data?.stream_url : json.data?.url;
  } catch (e) { return null; }
};
