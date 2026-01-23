
import React, { useEffect, useState } from 'react';
import { UserProfile, StorageHealth } from '../types';
import { supabase } from '../services/supabase';

interface ProfileProps {
  user: UserProfile;
  onUpdate: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [health, setHealth] = useState<StorageHealth | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: user.username, bio: user.bio });

  useEffect(() => {
    const checkDisk = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 1;
        const usage = estimate.usage || 0;
        setHealth({
          quota,
          usage,
          percentUsed: (usage / quota) * 100
        });
      }
    };
    checkDisk();
  }, []);

  const handleToggleVip = () => {
    supabase.toggleVip();
    onUpdate();
  };

  const handleSave = () => {
    supabase.updateProfile(formData);
    setIsEditing(false);
    onUpdate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Profile Header */}
      <section className="glass rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-12 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full"></div>
        <div className="relative">
          <img 
            src={user.avatar} 
            alt="User" 
            className="w-48 h-48 rounded-[3rem] object-cover border-4 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
          />
          <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-fuchsia-500 rounded-2xl flex items-center justify-center border-4 border-slate-950 hover:scale-110 transition-transform">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
             </svg>
          </button>
        </div>

        <div className="flex-grow text-center md:text-left">
          {isEditing ? (
            <div className="space-y-4">
              <input 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white w-full font-orbitron text-2xl"
              />
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-300 w-full text-sm min-h-[80px]"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="bg-cyan-400 text-slate-950 px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs">Save Update</button>
                <button onClick={() => setIsEditing(false)} className="glass text-white px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h1 className="text-4xl font-orbitron font-black text-white">{user.username}</h1>
                <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] border ${user.is_vip ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {user.is_vip ? 'PREMIUM ACCESS: ACTIVE' : 'STANDARD CITIZEN'}
                </span>
              </div>
              <p className="text-slate-400 mt-4 leading-relaxed max-w-lg">{user.bio}</p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
                <button onClick={() => setIsEditing(true)} className="glass px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:border-cyan-400 transition-colors">Edit Identity</button>
                <button onClick={handleToggleVip} className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${user.is_vip ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]'}`}>
                  {user.is_vip ? 'Revoke VIP Privileges' : 'Authorize VIP Protocol'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Disk Health & History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="glass rounded-[3rem] p-10 space-y-6">
          <h3 className="font-orbitron font-bold text-white text-xl flex items-center gap-3">
            <span className="w-1.5 h-6 bg-cyan-400 rounded-full"></span>
            Disk <span className="text-cyan-400">Integrity</span>
          </h3>
          {health ? (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="text-xs text-slate-500 font-mono">SECTOR UTILIZATION</div>
                <div className="text-xl font-orbitron font-black text-white">{health.percentUsed.toFixed(2)}%</div>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000" 
                  style={{ width: `${health.percentUsed}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="glass p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total Quota</p>
                  <p className="text-sm font-orbitron text-white">{(health.quota / (1024 ** 3)).toFixed(2)} GB</p>
                </div>
                <div className="glass p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Used Cache</p>
                  <p className="text-sm font-orbitron text-white">{(health.usage / (1024 ** 2)).toFixed(2)} MB</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic text-center">Protocol: HTML5 StorageManager V2.1</p>
            </div>
          ) : (
            <p className="text-slate-500">Scanning sector storage...</p>
          )}
        </section>

        <section className="glass rounded-[3rem] p-10 space-y-6">
          <h3 className="font-orbitron font-bold text-white text-xl flex items-center gap-3">
            <span className="w-1.5 h-6 bg-fuchsia-400 rounded-full"></span>
            Neural <span className="text-fuchsia-400">History</span>
          </h3>
          <div className="space-y-4">
            {user.history.length > 0 ? (
                user.history.map((id, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 glass rounded-2xl border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                        <img src={`https://picsum.photos/seed/${id}/100`} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-grow">
                            <p className="text-sm font-bold text-white">Drama ID: {id}</p>
                            <p className="text-[10px] text-slate-500">Watched 2 days ago</p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-2 text-cyan-400">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-slate-500 text-center py-8 italic">No previous transmissions logged.</p>
            )}
            <button className="w-full py-3 glass rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors">Wipe Neural Cache</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
