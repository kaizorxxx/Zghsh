
import { createClient } from '@supabase/supabase-js';
import { UserProfile, AdConfig, SiteStats } from '../types';
import { MOCK_USER, INITIAL_AD_CONFIG } from '../constants';

// --- REAL SUPABASE CONFIGURATION ---
export const SUPABASE_URL = 'https://jvwwazeuxmisehplhmtl.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d3dhemV1eG1pc2VocGxobXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODM2NjUsImV4cCI6MjA4NDA1OTY2NX0.72ydk1kZOO_WnQthfHKyuFZHJwmxk0Zi4kOWjkYLzy0';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- MOCK SERVICE (Maintains compatibility with existing UI) ---
class SupabaseService {
  private userKey = 'nova_anime_current_user';
  private usersDbKey = 'nova_anime_users_db';
  private adsKey = 'nova_anime_ads_config';
  private statsKey = 'nova_anime_stats';

  constructor() {
    // Initialize DB if empty
    if (!localStorage.getItem(this.usersDbKey)) {
        const initialDb = [MOCK_USER];
        localStorage.setItem(this.usersDbKey, JSON.stringify(initialDb));
    }
    
    // Initialize Ads
    if (!localStorage.getItem(this.adsKey)) {
      localStorage.setItem(this.adsKey, JSON.stringify(INITIAL_AD_CONFIG));
    }

    // Initialize Stats
    if (!localStorage.getItem(this.statsKey)) {
        const initialStats = {
            totalViews: 12040,
            adClicks: 342,
            activeUsers: 0,
            visitorsHistory: [45, 67, 89, 120, 90, 110, 145] // Mock historical data
        };
        localStorage.setItem(this.statsKey, JSON.stringify(initialStats));
    }
  }

  // --- Auth Methods ---

  getProfile(): UserProfile | null {
    const data = localStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  logout() {
    localStorage.removeItem(this.userKey);
    window.location.reload();
  }

  login(identifier: string, password: string): { success: boolean; message: string; user?: UserProfile } {
    const users: UserProfile[] = JSON.parse(localStorage.getItem(this.usersDbKey) || '[]');
    
    const user = users.find(u => 
        (u.email === identifier || u.phoneNumber === identifier || u.username === identifier) && 
        u.password === password
    );

    if (user) {
        if (!user.is_verified) return { success: false, message: 'Akun belum diverifikasi.' };
        localStorage.setItem(this.userKey, JSON.stringify(user));
        return { success: true, message: 'Login berhasil.', user };
    }
    return { success: false, message: 'Email/Nomor atau Password salah.' };
  }

  register(data: Partial<UserProfile>): { success: boolean; message: string; userId?: string } {
    const users: UserProfile[] = JSON.parse(localStorage.getItem(this.usersDbKey) || '[]');
    
    if (users.some(u => u.email === data.email)) return { success: false, message: 'Email sudah terdaftar.' };
    if (users.some(u => u.phoneNumber === data.phoneNumber)) return { success: false, message: 'Nomor HP sudah terdaftar.' };

    const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        username: data.username || 'User',
        email: data.email!,
        phoneNumber: data.phoneNumber,
        password: data.password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        bio: 'Pengguna baru NovaDrama.',
        is_vip: false,
        is_verified: false,
        history: [],
        favorites: []
    };

    users.push(newUser);
    localStorage.setItem(this.usersDbKey, JSON.stringify(users));
    return { success: true, message: 'Registrasi berhasil. Silakan verifikasi.', userId: newUser.id };
  }

  verifyUser(email: string, code: string): boolean {
    if (code !== '1234') return false;

    const users: UserProfile[] = JSON.parse(localStorage.getItem(this.usersDbKey) || '[]');
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
        users[userIndex].is_verified = true;
        localStorage.setItem(this.usersDbKey, JSON.stringify(users));
        localStorage.setItem(this.userKey, JSON.stringify(users[userIndex]));
        return true;
    }
    return false;
  }

  // --- Profile Updates ---

  updateProfile(updates: Partial<UserProfile>) {
    const current = this.getProfile();
    if (!current) return null;

    const updated = { ...current, ...updates };
    localStorage.setItem(this.userKey, JSON.stringify(updated));

    const users: UserProfile[] = JSON.parse(localStorage.getItem(this.usersDbKey) || '[]');
    const newUsers = users.map(u => u.id === current.id ? updated : u);
    localStorage.setItem(this.usersDbKey, JSON.stringify(newUsers));

    return updated;
  }

  toggleFavorite(animeId: string) {
    const profile = this.getProfile();
    if (!profile) return null;

    const isFav = profile.favorites.includes(animeId);
    const newFavs = isFav 
      ? profile.favorites.filter(id => id !== animeId)
      : [...profile.favorites, animeId];
    return this.updateProfile({ favorites: newFavs });
  }

  addToHistory(animeId: string) {
    const profile = this.getProfile();
    if (!profile) return null;
    const newHistory = [animeId, ...profile.history.filter(id => id !== animeId)].slice(0, 20);
    return this.updateProfile({ history: newHistory });
  }

  toggleVip() {
    const profile = this.getProfile();
    if (!profile) return null;
    return this.updateProfile({ is_vip: !profile.is_vip });
  }

  // --- Ads & Stats ---

  getAds(): AdConfig {
    const data = localStorage.getItem(this.adsKey);
    return data ? JSON.parse(data) : INITIAL_AD_CONFIG;
  }

  updateAds(config: AdConfig) {
    localStorage.setItem(this.adsKey, JSON.stringify(config));
    return config;
  }

  getStats(): SiteStats {
      const data = localStorage.getItem(this.statsKey);
      const parsed = data ? JSON.parse(data) : { totalViews: 0, adClicks: 0, activeUsers: 0, visitorsHistory: [] };
      
      // Simulate real-time fluctuation for active users
      const baseUsers = 120;
      const fluctuation = Math.floor(Math.random() * 40) - 20; // +/- 20
      parsed.activeUsers = Math.max(1, baseUsers + fluctuation);
      
      return parsed;
  }

  incrementView() {
      const stats = this.getStats();
      stats.totalViews += 1;
      // Occasionally add to history for the graph effect
      if (Math.random() > 0.8) {
         const last = stats.visitorsHistory[stats.visitorsHistory.length - 1] || 100;
         stats.visitorsHistory.push(last + Math.floor(Math.random() * 10));
         if(stats.visitorsHistory.length > 20) stats.visitorsHistory.shift();
      }
      localStorage.setItem(this.statsKey, JSON.stringify(stats));
  }

  incrementAdClick() {
      const stats = this.getStats();
      stats.adClicks += 1;
      localStorage.setItem(this.statsKey, JSON.stringify(stats));
  }
}

export const supabase = new SupabaseService();
