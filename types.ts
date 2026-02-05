
export interface Anime {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  rating: number;
  episodes: number;
  genre: string[];
  releaseYear: number;
  status: 'Ongoing' | 'Completed';
  source: string;
  videoUrl?: string;
  type?: 'tv' | 'movie';
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  is_vip: boolean;
  history: string[]; // Anime IDs
  favorites: string[]; // Anime IDs
}

export interface AdConfig {
  enabled: boolean;
  monetagId: string;
  interstitialId: string;
  inPagePushId: string;
}

export interface StorageHealth {
  quota: number;
  usage: number;
  percentUsed: number;
}
