
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
  phoneNumber: '08123456789',
  password: 'password123',
  avatar: 'https://picsum.photos/seed/neo/200',
  bio: 'Living in the digital future of Chinese storytelling.',
  is_vip: false,
  is_verified: true,
  history: [],
  favorites: [],
};

export const INITIAL_AD_CONFIG = {
  enabled: true,
  showTopBanner: true,
  showSidebars: true,
  showPreroll: true,
  showPauseAd: true,
  monetagId: 'MT-12345',
  interstitialId: 'INT-6789',
  inPagePushId: 'IPP-1111',
  popunderLink: 'https://google.com', // Placeholder for ad redirect
};

export const FALLBACK_ANIME: Anime[] = [
  // ... existing fallback data if needed, omitted for brevity as it wasn't changed logically
];
