
import { UserProfile, AdConfig } from '../types';
import { MOCK_USER, INITIAL_AD_CONFIG } from '../constants';

class SupabaseService {
  private storageKey = 'nova_anime_user_data';
  private adsKey = 'nova_anime_ads_config';

  constructor() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(MOCK_USER));
    }
    // Initialize ad config in storage if it doesn't exist
    if (!localStorage.getItem(this.adsKey)) {
      localStorage.setItem(this.adsKey, JSON.stringify(INITIAL_AD_CONFIG));
    }
  }

  getProfile(): UserProfile {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
  }

  updateProfile(updates: Partial<UserProfile>) {
    const current = this.getProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    return updated;
  }

  toggleFavorite(animeId: string) {
    const profile = this.getProfile();
    const isFav = profile.favorites.includes(animeId);
    const newFavs = isFav 
      ? profile.favorites.filter(id => id !== animeId)
      : [...profile.favorites, animeId];
    return this.updateProfile({ favorites: newFavs });
  }

  addToHistory(animeId: string) {
    const profile = this.getProfile();
    const newHistory = [animeId, ...profile.history.filter(id => id !== animeId)].slice(0, 20);
    return this.updateProfile({ history: newHistory });
  }

  toggleVip() {
    const profile = this.getProfile();
    return this.updateProfile({ is_vip: !profile.is_vip });
  }

  // Retrieve current ad configuration from local storage
  getAds(): AdConfig {
    const data = localStorage.getItem(this.adsKey);
    return data ? JSON.parse(data) : INITIAL_AD_CONFIG;
  }

  // Persist updated ad configuration to local storage
  updateAds(config: AdConfig) {
    localStorage.setItem(this.adsKey, JSON.stringify(config));
    return config;
  }
}

export const supabase = new SupabaseService();
