
import React, { useEffect, useState } from 'react';
import { UserProfile, AnimeDetail } from '../types';
import { firebaseService as supabase } from '../services/firebase';
import { getDetail } from '../services/api';
import { Link, Navigate } from 'react-router-dom';

interface ProfileProps {
  user: UserProfile | null;
  onUpdate: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [formData, setFormData] = useState({ 
      username: '', 
      bio: '', 
      avatar: '',
      newPassword: '',
      confirmNewPassword: ''
  });
  const [loadingSave, setLoadingSave] = useState(false);
  
  // History Data
  const [historyItems, setHistoryItems] = useState<AnimeDetail[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            username: user.username,
            bio: user.bio,
            avatar: user.avatar
        }));

        // Load history details
        const loadHistory = async () => {
            setLoadingHistory(true);
            const items: AnimeDetail[] = [];
            // Slice to 5 for performance demo
            for (const id of user.history.slice(0, 5)) {
                try {
                    const res = await getDetail(id);
                    if (res.data) items.push(res.data);
                } catch (e) { console.error(e); }
            }
            setHistoryItems(items);
            setLoadingHistory(false);
        };
        loadHistory();
    }
  }, [user]);

  if (!user) {
      return <div className="text-center py-20 text-white">Silakan Login Terlebih Dahulu.</div>;
  }

  const handleSaveProfile = async () => {
      setLoadingSave(true);
      try {
        await supabase.updateProfile({
            username: formData.username,
            bio: formData.bio,
            avatar: formData.avatar
        });
        alert("Profil berhasil diperbarui!");
        onUpdate();
      } catch(e) {
          alert("Gagal memperbarui profil.");
      } finally {
          setLoadingSave(false);
      }
  };

  const handleChangePassword = async () => {
      if (!formData.newPassword) return;
      if (formData.newPassword !== formData.confirmNewPassword) {
          alert("Password baru tidak cocok.");
          return;
      }
      setLoadingSave(true);
      const res = await supabase.changePassword(formData.newPassword);
      setLoadingSave(false);
      alert(res.message);
      if (res.success) {
          setFormData(prev => ({ ...prev, newPassword: '', confirmNewPassword: '' }));
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fadeInUp">
      
      {/* Header Profile */}
      <div className="relative glass rounded-[3rem] p-8 md:p-12 overflow-hidden border-white/5 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-red-600/20 transition-all"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="relative shrink-0">
                  <img src={user.avatar} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-zinc-800 shadow-[0_0_40px_rgba(220,38,38,0.2)]" />
                  {user.is_verified && (
                      <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-4 border-black" title="Verified">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                  )}
              </div>
              
              <div className="text-center md:text-left space-y-4 flex-grow">
                  <div>
                      <h1 className="text-3xl md:text-5xl font-black font-orbitron text-white uppercase tracking-tighter">{user.username}</h1>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                          <span className="text-red-500 font-bold uppercase tracking-widest text-[10px] bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                              {user.is_vip ? 'VIP Member' : 'Free Account'}
                          </span>
                          <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                              {user.email}
                          </span>
                      </div>
                  </div>
                  <p className="text-zinc-400 italic max-w-xl text-sm leading-relaxed">
                      "{user.bio}"
                  </p>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                  <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white text-black' : 'bg-black text-white border border-zinc-800'}`}>
                      Overview
                  </button>
                  <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-black' : 'bg-black text-white border border-zinc-800'}`}>
                      Pengaturan
                  </button>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === 'overview' ? (
              <>
                {/* Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-8 rounded-[2rem] border-white/5 space-y-6">
                        <h3 className="font-orbitron font-bold text-white uppercase tracking-wider">Statistik Akun</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900/50 p-4 rounded-xl text-center">
                                <p className="text-2xl font-black text-white">{user.favorites?.length || 0}</p>
                                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Favorit</p>
                            </div>
                            <div className="bg-zinc-900/50 p-4 rounded-xl text-center">
                                <p className="text-2xl font-black text-white">{user.history?.length || 0}</p>
                                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Ditonton</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History List */}
                <div className="lg:col-span-2">
                    <div className="glass p-8 rounded-[2rem] border-white/5 h-full">
                        <h3 className="font-orbitron font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                            Terakhir Ditonton
                        </h3>
                        
                        {loadingHistory ? (
                            <div className="text-center py-10 text-zinc-500 text-xs animate-pulse">Memuat riwayat neural...</div>
                        ) : historyItems.length > 0 ? (
                            <div className="space-y-4">
                                {historyItems.map((item, idx) => (
                                    <Link to={`/drama/${item.episodes[0].slug}`} key={idx} className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-2xl hover:bg-zinc-900/80 transition-all group cursor-pointer border border-transparent hover:border-red-600/20">
                                        <img src={item.thumbnail} className="w-16 h-16 rounded-xl object-cover" />
                                        <div className="flex-grow">
                                            <h4 className="text-white font-bold text-sm truncate group-hover:text-red-500 transition-colors">{item.title}</h4>
                                            <div className="flex gap-2 text-[10px] text-zinc-500 mt-1 uppercase font-bold">
                                                <span>{item.info.tipe}</span>
                                                <span>•</span>
                                                <span>{item.info.status}</span>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-white text-black text-[10px] font-black rounded-lg uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            Lanjut
                                        </button>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-zinc-600 italic text-sm">Belum ada aktivitas menonton.</div>
                        )}
                    </div>
                </div>
              </>
          ) : (
              // SETTINGS TAB
              <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Edit Profile Form */}
                      <div className="glass p-8 rounded-[2rem] border-white/5 space-y-6">
                           <h3 className="font-orbitron font-bold text-white uppercase tracking-wider mb-2">Edit Profil</h3>
                           <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1 block">Username</label>
                                    <input 
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1 block">Bio</label>
                                    <textarea 
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none h-24 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1 block">Avatar URL</label>
                                    <input 
                                        value={formData.avatar}
                                        onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none text-xs"
                                    />
                                </div>
                                <button onClick={handleSaveProfile} disabled={loadingSave} className="w-full bg-white text-black font-black uppercase tracking-widest py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50">
                                    Simpan Perubahan
                                </button>
                           </div>
                      </div>

                      {/* Change Password Form */}
                      <div className="glass p-8 rounded-[2rem] border-white/5 space-y-6">
                           <h3 className="font-orbitron font-bold text-white uppercase tracking-wider mb-2">Ganti Password</h3>
                           <div className="space-y-4">
                                <p className="text-xs text-zinc-400 mb-2">Jika login via Google/GitHub, password tidak dapat diubah di sini.</p>
                                <input 
                                    type="password"
                                    placeholder="Password Baru"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none"
                                />
                                <input 
                                    type="password"
                                    placeholder="Konfirmasi Password Baru"
                                    value={formData.confirmNewPassword}
                                    onChange={(e) => setFormData({...formData, confirmNewPassword: e.target.value})}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none"
                                />
                                <button onClick={handleChangePassword} disabled={loadingSave} className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-colors disabled:opacity-50">
                                    Update Password
                                </button>
                           </div>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default Profile;
