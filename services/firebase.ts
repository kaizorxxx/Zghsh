
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
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection
} from 'firebase/firestore';
import { UserProfile, AdConfig, SiteStats } from '../types';
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
const db = getFirestore(app);

// Helper to keep local storage synced for synchronous access (compatibility mode)
const CACHE_KEY = 'nova_firebase_user_cache';

class FirebaseService {
  constructor() {
    // Listener to update local cache and handle auth state
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await this.fetchUserProfile(user);
        localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    });
  }

  // --- Helpers ---

  private async fetchUserProfile(user: User): Promise<UserProfile> {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Merge Auth data with Firestore data
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
        favorites: data.favorites || []
      };
    } else {
      // Create default profile if not exists (e.g. first social login)
      const newProfile: UserProfile = {
        id: user.uid,
        email: user.email || '',
        username: user.displayName || 'User',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        bio: 'New member of NovaDrama',
        is_vip: false,
        is_verified: user.emailVerified,
        history: [],
        favorites: []
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
  }

  // --- Public Methods (Matching Old Supabase Interface) ---

  getProfile(): UserProfile | null {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  }

  // Hook for React components to subscribe to real-time changes
  onAuthChange(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await this.fetchUserProfile(user);
        callback(profile);
      } else {
        callback(null);
      }
    });
  }

  async login(identifier: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      // Note: Firebase Auth mainly uses Email, not username. 
      // If identifier is not email, this simple implementation might fail.
      // Assuming email for now.
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

      // Update Auth Profile
      await updateAuthProfile(user, {
        displayName: data.username,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`
      });

      // Send Verification Email
      await sendEmailVerification(user);

      // Create Firestore Doc
      await setDoc(doc(db, 'users', user.uid), {
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        avatar: user.photoURL,
        bio: 'New member of NovaDrama',
        is_vip: false,
        history: [],
        favorites: []
      });

      return { success: true, message: 'Registration successful. Verification email sent.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async socialLogin(providerName: 'google' | 'github'): Promise<{ success: boolean; message: string }> {
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      // Profile creation handled in fetchUserProfile/onAuthStateChanged
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
    // In Firebase, verification is done by clicking the email link.
    // We can reload the user to check if they clicked it.
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

  // --- Profile Updates ---

  async updateProfile(updates: Partial<UserProfile>) {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    await updateDoc(docRef, updates);

    // Update local cache immediately for UI responsiveness
    const current = this.getProfile();
    if (current) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ...current, ...updates }));
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
    
    // Simple dedupe and limit
    const newHistory = [animeId, ...profile.history.filter(id => id !== animeId)].slice(0, 20);
    await this.updateProfile({ history: newHistory });
  }

  // --- Ads & Stats (Using Firestore "globals" collection or LocalStorage fallback) ---

  getAds(): AdConfig {
    // For speed, we stick to localStorage for Ads config unless we implement full Admin fetch
    const data = localStorage.getItem('nova_ads_config');
    return data ? JSON.parse(data) : INITIAL_AD_CONFIG;
  }

  updateAds(config: AdConfig) {
    localStorage.setItem('nova_ads_config', JSON.stringify(config));
    // Ideally push to Firestore: setDoc(doc(db, 'globals', 'ads'), config);
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
      localStorage.setItem('nova_stats', JSON.stringify(stats));
  }

  incrementAdClick() {
      const stats = this.getStats();
      stats.adClicks += 1;
      localStorage.setItem('nova_stats', JSON.stringify(stats));
  }
}

export const firebaseService = new FirebaseService();
