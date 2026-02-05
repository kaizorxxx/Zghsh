
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AnimeDetails from './pages/DramaDetails';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import About from './pages/About';
import { supabase } from './services/supabase';
import { UserProfile, AdConfig } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(supabase.getProfile());
  // Fix: Directly call the newly implemented getAds method
  const [adConfig, setAdConfig] = useState<AdConfig>(supabase.getAds());

  const refreshUser = () => {
    setUser({ ...supabase.getProfile() });
  };

  const refreshAds = () => {
    setAdConfig({ ...supabase.getAds() });
  };

  return (
    <Router>
      <Layout user={user} adConfig={adConfig}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drama/:id" element={<AnimeDetails user={user} />} />
          <Route path="/profile" element={<Profile user={user} onUpdate={refreshUser} />} />
          <Route path="/admin" element={<Admin user={user} adConfig={adConfig} onUpdateAds={refreshAds} onUpdateUser={refreshUser} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
