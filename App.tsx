
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AnimeDetails from './pages/DramaDetails';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import About from './pages/About';
import AuthModal from './components/AuthModal';
import { supabase } from './services/supabase';
import { UserProfile, AdConfig } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adConfig, setAdConfig] = useState<AdConfig>(supabase.getAds());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    setUser(supabase.getProfile());
  }, []);

  const refreshUser = () => {
    setUser(supabase.getProfile());
  };

  const refreshAds = () => {
    setAdConfig(supabase.getAds());
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <Router>
      <Layout 
        user={user} 
        adConfig={adConfig} 
        onOpenAuth={() => openAuth('login')}
        onLogout={() => { supabase.logout(); refreshUser(); }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drama/:id" element={<AnimeDetails user={user || {favorites: [], history: []} as any} />} />
          <Route path="/profile" element={<Profile user={user} onUpdate={refreshUser} />} />
          <Route path="/history" element={<Profile user={user} onUpdate={refreshUser} />} /> 
          <Route path="/admin" element={<Admin user={user || {} as any} adConfig={adConfig} onUpdateAds={refreshAds} onUpdateUser={refreshUser} />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode}
        onLoginSuccess={refreshUser}
      />
    </Router>
  );
};

export default App;
