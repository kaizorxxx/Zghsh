
import React from 'react';
import { Anime } from './types';

export const THEME_COLORS = {
  primary: '#22d3ee', // Cyan 400
  secondary: '#e879f9', // Fuchsia 400
  accent: '#a855f7', // Purple 500
  background: '#020617', // Slate 950
  surface: '#0f172a', // Slate 900
};

export const MOCK_USER: any = {
  id: 'user_123',
  username: 'NeoStreamer',
  email: 'neo@nova.drama',
  avatar: 'https://picsum.photos/seed/neo/200',
  bio: 'Living in the digital future of Chinese storytelling.',
  is_vip: false,
  history: ['1', '2'],
  favorites: ['3'],
};

export const INITIAL_AD_CONFIG = {
  enabled: true,
  monetagId: 'MT-12345',
  interstitialId: 'INT-6789',
  inPagePushId: 'IPP-1111',
};

export const FALLBACK_ANIME: Anime[] = [
  {
    id: 'mock_1',
    title: 'Neo-Soul Chronicles: 2077',
    thumbnail: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800&h=1200',
    description: 'In a world where memories are traded like currency, a rogue detective uncovers a conspiracy that threatens the very fabric of digital existence.',
    rating: 9.8,
    episodes: 24,
    genre: ['Cyberpunk', 'Action', 'Romance'],
    releaseYear: 2077,
    status: 'Ongoing',
    source: 'Neural Cache',
    seasons: [{ number: 1, name: 'Season 1', episodeCount: 12 }, { number: 2, name: 'Season 2', episodeCount: 12 }]
  },
  {
    id: 'mock_2',
    title: 'Digital Emperor: The Last Protocol',
    thumbnail: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=800&h=1200',
    description: 'The heir to the largest tech empire must go underground to reclaim his throne after a brutal AI coup.',
    rating: 9.2,
    episodes: 40,
    genre: ['Sci-Fi', 'Wuxia', 'Drama'],
    releaseYear: 2076,
    status: 'Completed',
    source: 'Neural Cache',
    seasons: [{ number: 1, name: 'Season 1', episodeCount: 20 }, { number: 2, name: 'Season 2', episodeCount: 20 }]
  },
  {
    id: 'mock_3',
    title: 'Electric Lotus blooming in Void',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800&h=1200',
    description: 'A traditional dancer in Neo-Beijing discovers she can manipulate the data-stream through her movements.',
    rating: 8.9,
    episodes: 16,
    genre: ['Music', 'Fantasy', 'Romance'],
    releaseYear: 2075,
    status: 'Completed',
    source: 'Neural Cache'
  },
  {
    id: 'mock_4',
    title: 'Ghost in the Red Walls',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800&h=1200',
    description: 'Palace intrigue meets high-tech espionage in this reimagining of the Forbidden City as a server hub.',
    rating: 9.5,
    episodes: 52,
    genre: ['Historical', 'Techno-Thriller'],
    releaseYear: 2077,
    status: 'Ongoing',
    source: 'Neural Cache'
  },
  {
    id: 'mock_5',
    title: 'Carbon-Fiber Cultivator',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800&h=1200',
    description: 'Cultivation reaches the stars as practitioners use nano-implants to reach enlightenment.',
    rating: 8.7,
    episodes: 100,
    genre: ['Xianxia', 'Futuristic'],
    releaseYear: 2074,
    status: 'Completed',
    source: 'Neural Cache'
  },
  {
    id: 'mock_6',
    title: 'Cyber-Silk Road',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800&h=1200',
    description: 'Merchants navigate the dangerous inter-dimensional trade routes in search of ancient artifacts.',
    rating: 9.0,
    episodes: 12,
    genre: ['Adventure', 'Mystery'],
    releaseYear: 2077,
    status: 'Ongoing',
    source: 'Neural Cache'
  }
];
