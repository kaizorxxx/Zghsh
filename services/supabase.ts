
import { UserProfile, AdConfig } from '../types';
import { MOCK_USER, INITIAL_AD_CONFIG } from '../constants';

class MockSupabase {
  private profile: UserProfile = { ...MOCK_USER };
  private ads: AdConfig = { ...INITIAL_AD_CONFIG };

  getProfile() {
    return this.profile;
  }

  updateProfile(updates: Partial<UserProfile>) {
    this.profile = { ...this.profile, ...updates };
    return this.profile;
  }

  toggleVip() {
    this.profile.is_vip = !this.profile.is_vip;
    return this.profile.is_vip;
  }

  getAds() {
    return this.ads;
  }

  updateAds(updates: Partial<AdConfig>) {
    this.ads = { ...this.ads, ...updates };
    return this.ads;
  }

  // Auth Mocks
  async signInWithGoogle() {
    console.log("Mock Google Sign In");
    return { user: this.profile, error: null };
  }
}

export const supabase = new MockSupabase();
