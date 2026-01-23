
import React, { useState } from 'react';
import { UserProfile, AdConfig } from '../types';
import { supabase } from '../services/supabase';

interface AdminProps {
  user: UserProfile;
  adConfig: AdConfig;
  onUpdateAds: () => void;
  onUpdateUser: () => void;
}

const Admin: React.FC<AdminProps> = ({ user, adConfig, onUpdateAds, onUpdateUser }) => {
  const [adsForm, setAdsForm] = useState<AdConfig>({ ...adConfig });

  const handleSaveAds = () => {
    supabase.updateAds(adsForm);
    onUpdateAds();
    alert("System Overload Handled: Ad Configuration Propagated.");
  };

  const handleToggleVip = () => {
      supabase.toggleVip();
      onUpdateUser();
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-orbitron font-black text-white flex items-center gap-4">
          <span className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-slate-950 text-2xl">A</span>
          CONTROL <span className="text-red-500">CENTER</span>
        </h1>
        <div className="text-[10px] text-slate-500 font-mono border border-white/10 px-4 py-2 rounded-full">
            AUTHENTICATION: OVERRIDE_ADMIN_LVL_9
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Ads Management */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass rounded-[3rem] p-10 border-red-500/10">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Broadcast Modulation (Monetag)
            </h2>
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">In-Page Push ID</label>
                <input 
                  value={adsForm.inPagePushId} 
                  onChange={(e) => setAdsForm({...adsForm, inPagePushId: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-red-500/50 outline-none"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setAdsForm({...adsForm, enabled: !adsForm.enabled})}
                    className={`w-14 h-8 rounded-full border-2 transition-all p-1 ${adsForm.enabled ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}
                  >
                    <div className={`w-5 h-5 rounded-full shadow-lg transition-transform ${adsForm.enabled ? 'bg-green-500 translate-x-6' : 'bg-red-500'}`}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Global Broadcast Toggle</span>
                </label>
              </div>
            </div>
            <button 
              onClick={handleSaveAds}
              className="mt-12 w-full py-4 bg-red-500 text-slate-950 font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all"
            >
              Commit Changes to Matrix
            </button>
          </section>

          <section className="glass rounded-[3rem] p-10 border-white/5">
             <h2 className="text-2xl font-orbitron font-bold text-white mb-8">System Telemetry</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Uptime', val: '99.98%' },
                    { label: 'Latency', val: '24ms' },
                    { label: 'Nodes', val: '1,204' },
                    { label: 'Errors', val: '0' },
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{stat.label}</p>
                        <p className="text-lg font-orbitron text-cyan-400 mt-1">{stat.val}</p>
                    </div>
                ))}
             </div>
          </section>
        </div>

        {/* User Management Sidebar */}
        <section className="glass rounded-[3rem] p-8 space-y-8">
           <h2 className="text-xl font-orbitron font-bold text-white flex items-center gap-3">
              <span className="w-1.5 h-6 bg-cyan-400 rounded-full"></span>
              Citizens DB
           </h2>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass rounded-2xl border-cyan-400/20 bg-cyan-400/5">
                 <div className="flex items-center gap-3">
                    <img src={user.avatar} className="w-10 h-10 rounded-xl" />
                    <div>
                        <p className="text-sm font-bold text-white">{user.username}</p>
                        <p className="text-[10px] text-slate-500">{user.id}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className={`text-[10px] font-black uppercase ${user.is_vip ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {user.is_vip ? 'VIP' : 'STD'}
                    </p>
                    <button onClick={handleToggleVip} className="text-[10px] text-white/40 hover:text-white underline underline-offset-4 mt-1">
                        Manual Toggle
                    </button>
                 </div>
              </div>
              <div className="text-center py-12">
                 <p className="text-xs text-slate-600 font-mono">Syncing additional 4,921 entries...</p>
                 <div className="w-full h-0.5 bg-slate-900 mt-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-400/20 animate-[pulse_2s_infinite]"></div>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
