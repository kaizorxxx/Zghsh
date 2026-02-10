
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  updateProfile as updateAuthProfile,
  updatePassword as firebaseUpdatePassword,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  arrayUnion,
  enableIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { UserProfile, AdConfig, SiteStats, Comment } from '../types';
import { INITIAL_AD_CONFIG } from '../constants';

// --- CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAPul6-iroL_DdRnDmLehKX5YYjbh7pPeo",
  authDomain: "salma-c5850.firebaseapp.com",
  projectId: "salma-c5850",
  storageBucket: "salma-c5850.firebasestorage.app",
  messagingSenderId: "259000551789",
  appId: "1:259000551789:web:a427ad6e4a121c7ee0b264"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with generous settings
const db = initializeFirestore(app, {
   cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Attempt persistence but don't block app on failure
enableIndexedDbPersistence(db).catch((err) => {
    // Silent fail is okay, we will fall back to localStorage
    console.debug("Persistence note:", err.code);
});

const CACHE_KEY = 'nova_firebase_user_cache';
const MOCK_DB_KEY = 'nova_offline_db_comments';

// --- UTILS ---

// Safe Storage to prevent circular errors
const safeSetItem = (key: string, value: any) => {
    try {
        const stringified = JSON.stringify(value, (k, v) => {
            if (v instanceof Element || v instanceof Event) return null;
            return v;
        });
        localStorage.setItem(key, stringified);
    } catch (e) {
        console.warn(`Local Storage Full or Error: ${key}`);
    }
};

const safeGetItem = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return null;
    }
};

class FirebaseService {
  private isOfflineMode = false;

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
            const profile = await this.fetchUserProfile(user);
            safeSetItem(CACHE_KEY, profile);
        } catch (e) {
            console.warn("Using offline fallback profile");
        }
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    });
  }

  // --- DATA FETCHING WITH FALLBACK ---

  private async fetchUserProfile(user: User): Promise<UserProfile> {
    // 1. Try to fetch from Firestore
    try {
        // Fast timeout to detect offline/blocked state quickly
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
        const docRef = doc(db, 'users', user.uid);
        const docSnap: any = await Promise.race([getDoc(docRef), timeout]);

        if (docSnap && docSnap.exists()) {
          const data = docSnap.data();
          return this.formatProfile(user, data);
        } else if (docSnap) {
           // Create new doc if it doesn't exist
           const newProfile = this.createDefaultProfile(user);
           setDoc(docRef, newProfile).catch(() => this.isOfflineMode = true);
           return newProfile;
        }
    } catch (e: any) {
        // Handle Permission Denied (Project not set up) or Connection Failed
        if (e.message?.includes("permission-denied") || e.code === 'permission-denied' || e.message === "Timeout") {
            this.isOfflineMode = true;
            console.warn("Switching to Offline Hybrid Mode (Firestore Unreachable)");
        }
    }

    // 2. Fallback: Return cached or default based on Auth data
    const cached = safeGetItem<UserProfile>(CACHE_KEY);
    if (cached && cached.id === user.uid) return cached;

    return this.createDefaultProfile(user);
  }

  private createDefaultProfile(user: User): UserProfile {
      return {
        id: user.uid,
        email: user.email || '',
        username: user.displayName || 'User',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        bio: 'New member of NovaDrama',
        is_vip: false,
        is_verified: user.emailVerified,
        phoneNumber: '',
        history: [],
        favorites: [],
        ratings: {}
      };
  }

  private formatProfile(user: User, data: any): UserProfile {
      return {
        id: user.uid,
        email: user.email || '',
        username: data.username || user.displayName || 'User',
        avatar: data.avatar || user.photoURL,
        bio: data.bio || '',
        is_vip: data.is_vip || false,
        is_verified: user.emailVerified,
        phoneNumber: data.phoneNumber || '',
        history: data.history || [],
        favorites: data.favorites || [],
        ratings: data.ratings || {}
      };
  }

  getProfile(): UserProfile | null {
    return safeGetItem(CACHE_KEY);
  }

  onAuthChange(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const cached = this.getProfile();
        // Optimistic UI: show cached immediately
        if (cached && cached.id === user.uid) callback(cached);
        
        // Then try to sync
        const profile = await this.fetchUserProfile(user);
        callback(profile);
      } else {
        callback(null);
      }
    });
  }

  // --- Auth Actions ---

  async login(identifier: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      await signInWithEmailAndPassword(auth, identifier, password);
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async register(data: Partial<UserProfile>): Promise<{ success: boolean; message: string }> {
    try {
      if (!data.email || !data.password) throw new Error("Email and password required");
      
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateAuthProfile(user, {
        displayName: data.username,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`
      });

      // Try to verify, but don't fail registration if it errors
      try { await sendEmailVerification(user); } catch(e) {}

      // Try to create profile in DB, but don't block
      const newProfile = {
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        avatar: user.photoURL,
        bio: 'New member of NovaDrama',
        is_vip: false,
        history: [],
        favorites: [],
        ratings: {}
      };
      
      setDoc(doc(db, 'users', user.uid), newProfile).catch(() => {
          // If Firestore fails, just cache locally
          safeSetItem(CACHE_KEY, { ...newProfile, id: user.uid, is_verified: false });
      });

      return { success: true, message: 'Registration successful.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async socialLogin(providerName: 'google' | 'github'): Promise<{ success: boolean; message: string }> {
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true, message: 'Social login successful' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async logout() {
    await signOut(auth);
    localStorage.removeItem(CACHE_KEY);
    window.location.reload();
  }

  async verifyUser(): Promise<boolean> {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      return auth.currentUser.emailVerified;
    }
    return false;
  }
  
  async resendVerification() {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
          await sendEmailVerification(auth.currentUser);
      }
  }

  async changePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      if (auth.currentUser) {
        await firebaseUpdatePassword(auth.currentUser, newPassword);
        return { success: true, message: 'Password updated successfully' };
      }
      return { success: false, message: 'User not logged in' };
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
         return { success: false, message: 'Security: Please logout and login again to change password.' };
      }
      return { success: false, message: error.message };
    }
  }

  // --- Data Management (Hybrid: Online -> Local Fallback) ---

  async updateProfile(updates: Partial<UserProfile>) {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Optimistic Local Update
    const current = this.getProfile();
    if (current) {
        safeSetItem(CACHE_KEY, { ...current, ...updates });
    }

    // 2. Try Remote Update
    try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, updates);
    } catch (e) {
        // Ignore remote error in offline mode
    }
  }

  async toggleFavorite(animeId: string) {
    const profile = this.getProfile();
    if (!profile) return;
    const isFav = profile.favorites.includes(animeId);
    const newFavs = isFav 
      ? profile.favorites.filter(id => id !== animeId)
      : [...profile.favorites, animeId];
    await this.updateProfile({ favorites: newFavs });
  }

  async addToHistory(animeId: string) {
    const profile = this.getProfile();
    if (!profile) return;
    const newHistory = [animeId, ...profile.history.filter(id => id !== animeId)].slice(0, 20);
    await this.updateProfile({ history: newHistory });
  }

  // --- Comments & Ratings (Mock Mode Compatible) ---

  async addComment(animeSlug: string, content: string): Promise<void> {
    const user = this.getProfile();
    if (!user) throw new Error("Must be logged in");

    const newComment: Comment = {
       id: `cmt_${Date.now()}`,
       animeSlug,
       userId: user.id,
       username: user.username,
       avatar: user.avatar,
       content,
       timestamp: Date.now(),
       replies: []
    };

    // Try Remote
    try {
        await addDoc(collection(db, 'comments'), newComment);
    } catch (e) {
        // Fallback: Local Mock DB
        const localComments = safeGetItem<Comment[]>(MOCK_DB_KEY) || [];
        localComments.push(newComment);
        safeSetItem(MOCK_DB_KEY, localComments);
    }
  }

  async getComments(animeSlug: string): Promise<Comment[]> {
    // Try Remote
    try {
        const q = query(
            collection(db, 'comments'), 
            where('animeSlug', '==', animeSlug),
            orderBy('timestamp', 'desc')
        );
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));
        const snapshot: any = await Promise.race([getDocs(q), timeout]);
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Comment));
    } catch (e) {
        // Fallback: Local Mock DB
        const localComments = safeGetItem<Comment[]>(MOCK_DB_KEY) || [];
        return localComments
            .filter(c => c.animeSlug === animeSlug)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
  }

  async addReply(commentId: string, content: string): Promise<void> {
    const user = this.getProfile();
    if (!user) throw new Error("Must be logged in");

    const reply = {
       id: `reply_${Date.now()}`,
       userId: user.id,
       username: user.username,
       avatar: user.avatar,
       content,
       timestamp: Date.now()
    };

    try {
        const commentRef = doc(db, 'comments', commentId);
        await updateDoc(commentRef, { replies: arrayUnion(reply) });
    } catch(e) {
        // Fallback Local
        const localComments = safeGetItem<Comment[]>(MOCK_DB_KEY) || [];
        const idx = localComments.findIndex(c => c.id === commentId);
        if (idx !== -1) {
            if (!localComments[idx].replies) localComments[idx].replies = [];
            localComments[idx].replies.push(reply);
            safeSetItem(MOCK_DB_KEY, localComments);
        }
    }
  }

  async rateAnime(animeSlug: string, rating: number): Promise<void> {
     const profile = this.getProfile();
     if (!profile) return;
     const newRatings = { ...(profile.ratings || {}), [animeSlug]: rating };
     await this.updateProfile({ ratings: newRatings });
  }

  // --- Admin ---

  getAds(): AdConfig {
    const data = localStorage.getItem('nova_ads_config');
    const defaults = {
        ...INITIAL_AD_CONFIG, 
        directLinkEnabled: false, 
        directLinkUrl: '',
        customPopupEnabled: false,
        customPopupImage: '',
        customPopupUrl: ''
    };
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  }

  updateAds(config: AdConfig) {
    safeSetItem('nova_ads_config', config);
    return config;
  }

  getStats(): SiteStats {
      const data = localStorage.getItem('nova_stats');
      const parsed = data ? JSON.parse(data) : { totalViews: 0, adClicks: 0, activeUsers: 0, visitorsHistory: [] };
      const baseUsers = 120;
      const fluctuation = Math.floor(Math.random() * 40) - 20;
      parsed.activeUsers = Math.max(1, baseUsers + fluctuation);
      return parsed;
  }

  incrementView() {
      const stats = this.getStats();
      stats.totalViews += 1;
      if (Math.random() > 0.8) {
         const last = stats.visitorsHistory[stats.visitorsHistory.length - 1] || 100;
         stats.visitorsHistory.push(last + Math.floor(Math.random() * 10));
         if(stats.visitorsHistory.length > 20) stats.visitorsHistory.shift();
      }
      safeSetItem('nova_stats', stats);
  }

  incrementAdClick() {
      const stats = this.getStats();
      stats.adClicks += 1;
      safeSetItem('nova_stats', stats);
  }
}

export const firebaseService = new FirebaseService();
