
export interface Drama {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  rating: number;
  episodes: number;
  genre: string[];
  releaseYear: number;
  status: 'Ongoing' | 'Completed';
  source: 'Dramabox' | 'Melolo';
  chapters?: any[]; // For Dramabox chapters
  videoUrl?: string; // Resolved streaming URL
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  is_vip: boolean;
  history: string[]; // Drama IDs
  favorites: string[]; // Drama IDs
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
