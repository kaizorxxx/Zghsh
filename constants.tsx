
import React from 'react';

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
