
// --- Existing App Types (Keep these for Admin/Profile/Layout compatibility) ---

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password?: string; // Only for local mock, not stored in real app state usually
  avatar: string;
  bio: string;
  is_vip: boolean;
  is_verified?: boolean;
  history: string[]; // Anime IDs/Slugs
  favorites: string[]; // Anime IDs/Slugs
  ratings?: Record<string, number>; // { 'slug': 5 }
}

export interface AdConfig {
  enabled: boolean; // Master switch
  showTopBanner: boolean;
  showSidebars: boolean;
  showPreroll: boolean;
  showPauseAd: boolean;
  monetagId: string;
  interstitialId: string;
  inPagePushId: string;
  popunderLink: string;
  
  // New Features
  directLinkEnabled: boolean;
  directLinkUrl: string; // URL to open when clicking video overlay
  
  customPopupEnabled: boolean;
  customPopupImage: string;
  customPopupUrl: string;
}

export interface SiteStats {
  totalViews: number;
  adClicks: number;
  activeUsers: number; // Simulated
  visitorsHistory: number[]; // For graph
}

export interface Comment {
  id: string;
  animeSlug: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: number;
  replies: Reply[];
}

export interface Reply {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: number;
}

// --- New API Types ---

export interface AnimeItem {
  slug: string;
  title: string;
  thumbnail?: string;
  image?: string;
  type: string;
  latest_episode: string;
  episode?: string;
  release_time?: string;
}

export interface HomeResponse {
  status: string;
  data: {
    page: number;
    total_pages: number;
    anime: AnimeItem[];
  };
}

export interface AnimeDetail {
  title: string;
  thumbnail: string;
  synopsis: string;
  info: {
    status: string;
    studio: string;
    dirilis: string;
    durasi: string;
    season: string;
    tipe: string;
    censor: string;
    diposting_oleh: string;
    diperbarui_pada: string;
    genres: string[];
  };
  episodes: Array<{
    slug: string;
    episode: string;
    title: string;
    date: string;
  }>;
}

export interface DetailResponse {
  status: string;
  data: AnimeDetail;
}

export interface StreamingServer {
  name: string;
  type: string;
  url: string;
}

export interface DownloadLink {
  quality: string;
  links: Array<{
    provider: string;
    url: string;
  }>;
}

export interface WatchResponse {
  status: string;
  data: {
    title: string;
    streaming_servers: StreamingServer[];
    download_links: DownloadLink[];
  };
}

export interface ScheduleResponse {
  status: string;
  data: {
    [day: string]: AnimeItem[];
  };
}

export interface SearchResponse {
  status: string;
  data: {
    page: number;
    total_pages: number;
    anime: AnimeItem[];
    query?: string;
  };
}

export interface BatchResponse {
  status: string;
  data: {
    page: number;
    total_pages: number;
    anime: AnimeItem[];
  };
}
