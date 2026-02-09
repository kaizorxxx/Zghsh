
import React, { useState, useEffect } from 'react';
import { UserProfile, AdConfig, SiteStats } from '../types';
import { supabase } from '../services/supabase';

interface AdminProps {
  user: UserProfile;
  adConfig: AdConfig;
  onUpdateAds: () => void;
  onUpdateUser: () => void;
}

const Admin: React.FC<AdminProps> = ({ user, adConfig, onUpdateAds }) => {
  const [adsForm, setAdsForm] = useState<AdConfig>({ ...adConfig });
  const [stats, setStats] = useState<SiteStats>(supabase.getStats());

  // Real-time update loop
  useEffect(() => {
    const interval = setInterval(() => {
        setStats(supabase.getStats());
    }, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSaveAds = () => {
    supabase.updateAds(adsForm);
    onUpdateAds();
    alert("System Overload Handled: Ad Configuration Propagated.");
  };

  // Helper to draw a simple line chart from array
  const drawChart = (data: number[]) => {
      if (!data || !data.length) return null;
      const max = Math.max(...data) * 1.2; // slightly higher
      const points = data.map((val, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (val / max) * 100;
          return `${x},${y}`;
      }).join(' ');

      return (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-3d">
               <defs>
                   <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                       <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                   </linearGradient>
               </defs>
               <polyline 
                   fill="none" 
                   stroke="#ef4444" 
                   strokeWidth="2" 
                   points={points} 
                   className="drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
               />
               <polygon 
                   fill="url(#gradient)" 
                   points={`0,100 ${points} 100,100`} 
                   opacity="0.3"
               />
               {/* Data Points */}
               {data.map((val, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - (val / max) * 100;
                    return (
                        <circle key={i} cx={x} cy={y} r="1.5" fill="white" />
                    );
               })}
          </svg>
      );
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-orbitron font-black text-white flex items-center gap-4">
          <span className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-slate-950 text-2xl">A</span>
          CONTROL <span className="text-red-500">MATRIX</span>
        </h1>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">System Online</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono border border-white/10 px-4 py-2 rounded-full">
                ADMIN_LVL_9
            </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass p-8 rounded-[2rem] border-red-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-50 transition-opacity">
                    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Active Users (Real-time)</h3>
                <p className="text-5xl font-black font-orbitron text-white">{stats.activeUsers}</p>
                <div className="mt-4 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 animate-[pulse_1s_infinite]" style={{width: `${(stats.activeUsers / 200) * 100}%`}}></div>
                </div>
           </div>

           <div className="glass p-8 rounded-[2rem] border-white/10 relative overflow-hidden">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Page Views</h3>
                <p className="text-5xl font-black font-orbitron text-cyan-400">{stats.totalViews.toLocaleString()}</p>
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
                    {drawChart(stats.visitorsHistory)}
                </div>
           </div>

           <div className="glass p-8 rounded-[2rem] border-white/10 relative overflow-hidden">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Ad Clicks</h3>
                <p className="text-5xl font-black font-orbitron text-green-400">{stats.adClicks.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 mt-2 font-mono">CTR: {((stats.adClicks / stats.totalViews) * 100).toFixed(2)}%</p>
           </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Ads Management */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass rounded-[3rem] p-10 border-red-500/10">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Broadcast Modulation (Ads)
            </h2>

            {/* Granular Controls */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                    { label: 'Master Enable', key: 'enabled' },
                    { label: 'Top Banner', key: 'showTopBanner' },
                    { label: 'Sidebars (Desktop)', key: 'showSidebars' },
                    { label: 'Pre-roll Video', key: 'showPreroll' },
                    { label: 'Pause Menu Banner', key: 'showPauseAd' }
                ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5 cursor-pointer hover:border-red-500/30 transition-all">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{item.label}</span>
                        <div 
                            onClick={() => setAdsForm({...adsForm, [item.key]: !adsForm[item.key as keyof AdConfig]})}
                            className={`w-10 h-6 rounded-full border-2 transition-all p-0.5 relative ${adsForm[item.key as keyof AdConfig] ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}
                        >
                            <div className={`w-4 h-4 rounded-full shadow-lg transition-transform absolute top-0.5 ${adsForm[item.key as keyof AdConfig] ? 'bg-green-500 left-4' : 'bg-red-500 left-0.5'}`}></div>
                        </div>
                    </label>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Main Monetag ID</label>
                <input 
                  value={adsForm.monetagId} 
                  onChange={(e) => setAdsForm({...adsForm, monetagId: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-red-500/50 outline-none"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Interstitial ID</label>
                <input 
                  value={adsForm.interstitialId} 
                  onChange={(e) => setAdsForm({...adsForm, interstitialId: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-red-500/50 outline-none"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Pop-under Link (Pre-roll)</label>
                <input 
                  value={adsForm.popunderLink} 
                  onChange={(e) => setAdsForm({...adsForm, popunderLink: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-red-500/50 outline-none"
                />
              </div>
            </div>
            <button 
              onClick={handleSaveAds}
              className="mt-12 w-full py-4 bg-red-500 text-slate-950 font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all"
            >
              Commit Changes to Matrix
            </button>
          </section>

          {/* Traffic Graph Large */}
          <section className="glass rounded-[3rem] p-10 border-white/5 h-[300px] flex flex-col">
             <h2 className="text-xl font-orbitron font-bold text-white mb-4">Traffic Matrix</h2>
             <div className="flex-grow w-full relative">
                 {drawChart(stats.visitorsHistory)}
             </div>
             <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
                 <span>-1h</span>
                 <span>NOW</span>
             </div>
          </section>
        </div>

        {/* Sidebar Status */}
        <section className="glass rounded-[3rem] p-8 space-y-8 h-fit">
           <h2 className="text-xl font-orbitron font-bold text-white flex items-center gap-3">
              <span className="w-1.5 h-6 bg-cyan-400 rounded-full"></span>
              Admin Session
           </h2>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass rounded-2xl border-cyan-400/20 bg-cyan-400/5">
                 <div className="flex items-center gap-3">
                    <img src={user.avatar || 'https://ui-avatars.com/api/?name=Admin'} className="w-10 h-10 rounded-xl" alt="Admin" />
                    <div>
                        <p className="text-sm font-bold text-white">Administrator</p>
                        <p className="text-[10px] text-slate-500">ROOT ACCESS</p>
                    </div>
                 </div>
              </div>
              
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Performance</h4>
                  <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300">
                          <span>CPU Usage</span>
                          <span className="text-green-400">12%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full"><div className="w-[12%] h-full bg-green-500 rounded-full"></div></div>
                      
                      <div className="flex justify-between text-xs text-slate-300 mt-2">
                          <span>Memory</span>
                          <span className="text-yellow-400">45%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full"><div className="w-[45%] h-full bg-yellow-500 rounded-full"></div></div>
                  </div>
              </div>

              <div className="text-center py-8">
                 <p className="text-xs text-slate-600 font-mono">Encrypted Connection Established</p>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
