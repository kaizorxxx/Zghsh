
import { Anime } from '../types';

const BASE_URL = 'https://api.sansekai.my.id';

const mapToAnime = (item: any): Anime => ({
  id: String(item.id || item.anime_id),
  title: item.title || item.name || 'Unknown Title',
  thumbnail: item.thumbnail || item.poster || item.image || `https://picsum.photos/seed/${item.id}/800/1200`,
  description: item.description || item.synopsis || 'Deskripsi tidak tersedia.',
  rating: parseFloat(item.rating) || 8.0,
  episodes: parseInt(item.episodes) || 12,
  genre: item.genres ? (Array.isArray(item.genres) ? item.genres : item.genres.split(',')) : ['Anime'],
  releaseYear: parseInt(item.year) || 2024,
  status: item.status || 'Ongoing',
  source: 'Sansekai'
});

export const fetchLatestAnime = async (page: number = 1): Promise<Anime[]> => {
  try {
    const res = await fetch(`${BASE_URL}/anime/latest?page=${page}`);
    const data = await res.json();
    return (data.data || data).map(mapToAnime);
  } catch (e) {
    return [];
  }
};

export const searchAnime = async (query: string): Promise<Anime[]> => {
  try {
    const res = await fetch(`${BASE_URL}/anime/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return (data.data || data).map(mapToAnime);
  } catch (e) {
    return [];
  }
};

export const fetchAnimeRecommended = async (): Promise<Anime[]> => {
  try {
    const res = await fetch(`${BASE_URL}/anime/recommended`);
    const data = await res.json();
    return (data.data || data).map(mapToAnime);
  } catch (e) {
    return [];
  }
};

export const fetchAnimeDetail = async (id: string): Promise<Anime | null> => {
  try {
    const res = await fetch(`${BASE_URL}/anime/detail?id=${id}`);
    const data = await res.json();
    return mapToAnime(data.data || data);
  } catch (e) {
    return null;
  }
};

export const getAnimeVideo = async (id: string, ep: number = 1): Promise<string | null> => {
  try {
    const res = await fetch(`${BASE_URL}/anime/getvideo?id=${id}&ep=${ep}`);
    const data = await res.json();
    return data.url || data.link || data.stream || null;
  } catch (e) {
    return null;
  }
};
