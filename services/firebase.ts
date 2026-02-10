
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

// Initialize Firestore with settings to avoid hanging on offline
const db = initializeFirestore(app, {
   cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Attempt to enable offline persistence (silently fail if not supported/already enabled)
enableIndexedDbPersistence(db).catch((err) => {
    console.log("Persistence disabled:", err.code);
});

const CACHE_KEY = 'nova_firebase_user_cache';

// Helper for safe JSON storage to prevent "Converting circular structure to JSON"
const safeSetItem = (key: string, value: any) => {
    try {
        const stringified = JSON.stringify(value, (k, v) => {
            // Filter out circular references or DOM nodes if they accidentally got in
            if (v instanceof Element || v instanceof Event) return null;
            return v;
        });
        localStorage.setItem(key, stringified);
    } catch (e) {
        console.warn(`Failed to save ${key} to localStorage:`, e);
    }
};

class FirebaseService {
  constructor() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
            const profile = await this.fetchUserProfile(user);
            safeSetItem(CACHE_KEY, profile);
        } catch (e) {
            console.warn("Using offline fallback for user profile");
        }
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    });
  }

  // --- Helpers ---

  private async fetchUserProfile(user: User): Promise<UserProfile> {
    try {
        // Create a timeout promise to prevent hanging indefinitely
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
        const docRef = doc(db, 'users', user.uid);
        
        // Race against timeout
        const docSnap: any = await Promise.race([getDoc(docRef), timeout]);

        if (docSnap && docSnap.exists()) {
          const data = docSnap.data();
          return {
            id: user.uid,
            email: user.email || '',
            username: data.username || user.displayName || 'User',
            avatar: data.avatar || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            bio: data.bio || 'New member of NovaDrama',
            is_vip: data.is_vip || false,
            is_verified: user.emailVerified,
            phoneNumber: data.phoneNumber || '',
            history: data.history || [],
            favorites: data.favorites || [],
            ratings: data.ratings || {}
          };
        } else if (docSnap) {
           // Doc doesn't exist, create it (fire and forget to avoid blocking)
           const newProfile: UserProfile = {
            id: user.uid,
            email: user.email || '',
            username: user.displayName || 'User',
            avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            bio: 'New member of NovaDrama',
            is_vip: false,
            is_verified: user.emailVerified,
            history: [],
            favorites: [],
            ratings: {}
          };
          setDoc(docRef, newProfile).catch(e => console.warn("Failed to create profile doc", e));
          return newProfile;
        }
    } catch (e) {
        console.warn("Firestore unreachable, returning partial profile from Auth");
    }

    // Fallback if Firestore fails/times out
    return {
        id: user.uid,
        email: user.email || '',
        username: user.displayName || 'Offline User',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        bio: 'Offline Mode',
        is_vip: false,
        is_verified: user.emailVerified,
        history: [],
        favorites: [],
        ratings: {}
    };
  }

  getProfile(): UserProfile | null {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  }

  onAuthChange(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Return cached immediately for speed
        const cached = this.getProfile();
        if (cached && cached.id === user.uid) callback(cached);
        
        // Then fetch fresh
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

      await sendEmailVerification(user);

      // Fire and forget Firestore creation to avoid blocking UI if offline
      setDoc(doc(db, 'users', user.uid), {
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        avatar: user.photoURL,
        bio: 'New member of NovaDrama',
        is_vip: false,
        history: [],
        favorites: [],
        ratings: {}
      }).catch(e => console.warn("Offline: Profile queued for sync"));

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
         return { success: false, message: 'Keamanan: Silakan logout dan login kembali sebelum mengganti password.' };
      }
      return { success: false, message: error.message };
    }
  }

  // --- Data Management ---

  async updateProfile(updates: Partial<UserProfile>) {
    const user = auth.currentUser;
    if (!user) return;

    // Optimistic Update
    const current = this.getProfile();
    if (current) {
        safeSetItem(CACHE_KEY, { ...current, ...updates });
    }

    try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, updates);
    } catch (e) {
        console.warn("Profile update saved locally (offline mode)");
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

  // --- Comments & Ratings ---

  async addComment(animeSlug: string, content: string): Promise<void> {
    const user = this.getProfile();
    if (!user) throw new Error("Must be logged in");

    try {
        await addDoc(collection(db, 'comments'), {
            animeSlug,
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            content,
            timestamp: Date.now(),
            replies: []
        });
    } catch (e) {
        console.error("Failed to post comment", e);
    }
  }

  async getComments(animeSlug: string): Promise<Comment[]> {
    try {
        const q = query(
            collection(db, 'comments'), 
            where('animeSlug', '==', animeSlug),
            orderBy('timestamp', 'desc')
        );
        // Timeout protection for comments too
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
        const snapshot: any = await Promise.race([getDocs(q), timeout]);
        
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Comment));
    } catch (e) {
        return []; // Return empty if offline/timeout
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
        await updateDoc(commentRef, {
           replies: arrayUnion(reply)
        });
    } catch(e) {
        console.warn("Failed to reply");
    }
  }

  async rateAnime(animeSlug: string, rating: number): Promise<void> {
     const profile = this.getProfile();
     if (!profile) return;

     const newRatings = { ...(profile.ratings || {}), [animeSlug]: rating };
     await this.updateProfile({ ratings: newRatings });
  }

  // --- Admin (Settings) ---

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
