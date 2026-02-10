
import React, { useState, useEffect } from 'react';
import { UserProfile, AdConfig, SiteStats } from '../types';
import { firebaseService as supabase } from '../services/firebase';

interface AdminProps {
  user: UserProfile;
  adConfig: AdConfig;
  onUpdateAds: () => void;
  onUpdateUser: () => void;
}

const Admin: React.FC<AdminProps> = ({ user, adConfig, onUpdateAds }) => {
  const [adsForm, setAdsForm] = useState<AdConfig>({ ...adConfig });
  const [stats, setStats] = useState<SiteStats>(supabase.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
        setStats(supabase.getStats());
    }, 2000); 
    return () => clearInterval(interval);
  }, []);

  const handleSaveAds = () => {
    supabase.updateAds(adsForm);
    onUpdateAds();
    alert("System Overload Handled: Configuration Propagated.");
  };

  const drawChart = (data: number[]) => {
      if (!data || !data.length) return null;
      const max = Math.max(...data) * 1.2; 
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
        <div className="lg:col-span-2 space-y-8">
          
          {/* ADS & MONETIZATION */}
          <section className="glass rounded-[3rem] p-10 border-red-500/10">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Ads & Direct Links
            </h2>

            {/* Direct Link / Popunder */}
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 mb-8 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Direct Link (Video Click)</h3>
                    <div 
                        onClick={() => setAdsForm({...adsForm, directLinkEnabled: !adsForm.directLinkEnabled})}
                        className={`w-10 h-6 rounded-full border-2 transition-all p-0.5 relative cursor-pointer ${adsForm.directLinkEnabled ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}
                    >
                        <div className={`w-4 h-4 rounded-full shadow-lg transition-transform absolute top-0.5 ${adsForm.directLinkEnabled ? 'bg-green-500 left-4' : 'bg-red-500 left-0.5'}`}></div>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400">Jika aktif, klik pertama pada video akan membuka link ini di tab baru (Pop-under).</p>
                <input 
                  value={adsForm.directLinkUrl || ''} 
                  onChange={(e) => setAdsForm({...adsForm, directLinkUrl: e.target.value})}
                  placeholder="https://direct-link-url.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-red-500/50 outline-none"
                />
            </div>

            {/* Custom Manual Pop-up */}
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 mb-8 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">Global Manual Pop-up</h3>
                    <div 
                        onClick={() => setAdsForm({...adsForm, customPopupEnabled: !adsForm.customPopupEnabled})}
                        className={`w-10 h-6 rounded-full border-2 transition-all p-0.5 relative cursor-pointer ${adsForm.customPopupEnabled ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}
                    >
                        <div className={`w-4 h-4 rounded-full shadow-lg transition-transform absolute top-0.5 ${adsForm.customPopupEnabled ? 'bg-green-500 left-4' : 'bg-red-500 left-0.5'}`}></div>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400">Menampilkan gambar pop-up di tengah layar untuk semua pengunjung.</p>
                <div className="grid grid-cols-2 gap-4">
                    <input 
                        value={adsForm.customPopupImage || ''} 
                        onChange={(e) => setAdsForm({...adsForm, customPopupImage: e.target.value})}
                        placeholder="Image URL"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-red-500/50 outline-none"
                    />
                    <input 
                        value={adsForm.customPopupUrl || ''} 
                        onChange={(e) => setAdsForm({...adsForm, customPopupUrl: e.target.value})}
                        placeholder="Target Link URL"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-red-500/50 outline-none"
                    />
                </div>
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
            </div>

            <button 
              onClick={handleSaveAds}
              className="mt-12 w-full py-4 bg-red-500 text-slate-950 font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all"
            >
              Commit Changes
            </button>
          </section>
        </div>

        {/* Admin Status Sidebar */}
        <section className="glass rounded-[3rem] p-8 space-y-8 h-fit">
           <h2 className="text-xl font-orbitron font-bold text-white flex items-center gap-3">
              <span className="w-1.5 h-6 bg-cyan-400 rounded-full"></span>
              Admin Session
           </h2>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass rounded-2xl border-cyan-400/20 bg-cyan-400/5">
                 <div className="flex items-center gap-3">
                    <img src={user.avatar || 'https://ui-avatars.com/api/?name=Kaizo'} className="w-10 h-10 rounded-xl" alt="Admin" />
                    <div>
                        <p className="text-sm font-bold text-white">Kaizo</p>
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
                  </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
