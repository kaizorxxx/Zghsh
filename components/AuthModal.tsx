
import React, { useState } from 'react';
import { firebaseService as supabase } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify' | 'success_reg'>(initialMode);
  const [form, setForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
      setLoading(true);
      setError('');
      try {
          const res = await supabase.socialLogin(provider);
          if (res.success) {
              onLoginSuccess();
              onClose();
          } else {
              setError(res.message);
          }
      } catch (e: any) {
          setError(e.message);
      } finally {
          setLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const res = await supabase.login(form.email, form.password);
        if (res.success) {
          const isVerified = await supabase.verifyUser();
          if (!isVerified) {
             setMode('verify');
          } else {
             onLoginSuccess();
             onClose();
          }
        } else {
          setError(res.message);
        }
      } 
      else if (mode === 'signup') {
        if (form.password !== form.confirmPassword) {
            setError("Password tidak cocok!");
            setLoading(false);
            return;
        }
        if (!form.email) {
             setError("Email wajib diisi.");
             setLoading(false);
             return;
        }

        const res = await supabase.register({
            username: form.username,
            email: form.email,
            phoneNumber: form.phoneNumber,
            password: form.password
        });

        if (res.success) {
            setMode('success_reg'); // Show Instant Confirmation
        } else {
            setError(res.message);
        }
      } 
      else if (mode === 'verify') {
        const verified = await supabase.verifyUser();
        if (verified) {
            onLoginSuccess();
            onClose();
        } else {
            setError("Email belum diverifikasi. Silakan cek inbox Anda dan klik link verifikasi.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
      await supabase.resendVerification();
      alert("Link verifikasi dikirim ulang.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-zinc-950 border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-fadeInUp overflow-hidden">
        {/* Decorative Bg */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-2xl font-black font-orbitron text-white text-center mb-6 uppercase tracking-wider">
            {mode === 'login' ? 'Akses Sistem' : mode === 'signup' ? 'Daftar Anggota' : mode === 'success_reg' ? 'Akun Dibuat' : 'Verifikasi Email'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-xs font-bold mb-4 text-center">
                {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'success_reg' ? (
                <div className="text-center space-y-6 animate-fadeIn">
                     <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                        <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <div className="space-y-2">
                         <h3 className="text-xl font-bold text-white">Registrasi Berhasil!</h3>
                         <p className="text-sm text-zinc-400">Akun Anda telah dibuat. Langkah terakhir: Verifikasi email Anda.</p>
                     </div>
                     <button 
                        type="button"
                        onClick={() => setMode('verify')}
                        className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-zinc-200 transition-colors"
                     >
                        Lanjutkan Verifikasi
                     </button>
                </div>
            ) : mode === 'verify' ? (
                <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-sm text-zinc-300">
                        Link verifikasi telah dikirim ke <span className="text-white font-bold">{form.email}</span>.
                    </p>
                    <p className="text-xs text-zinc-500">
                        Silakan buka email Anda, klik link verifikasi, lalu klik tombol di bawah ini.
                    </p>
                    <div className="flex gap-2">
                        <button type="button" onClick={handleResend} className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-xl text-xs font-bold uppercase hover:text-white transition-colors">
                            Kirim Ulang
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                            Saya Sudah Verifikasi
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button 
                            type="button" 
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            <span className="text-[10px] font-black uppercase tracking-wider">Google</span>
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleSocialLogin('github')}
                            className="flex items-center justify-center gap-2 bg-[#24292e] text-white py-3 rounded-xl hover:bg-black transition-colors border border-zinc-700"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            <span className="text-[10px] font-black uppercase tracking-wider">GitHub</span>
                        </button>
                    </div>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-600"><span className="bg-zinc-950 px-2">Atau via Email</span></div>
                    </div>

                    {mode === 'signup' && (
                        <div className="space-y-4">
                            <input 
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none"
                                />
                                <input 
                                    name="phoneNumber"
                                    type="tel"
                                    placeholder="No. Telpon"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {mode === 'login' && (
                         <input 
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none"
                        />
                    )}

                    <input 
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none"
                    />

                    {mode === 'signup' && (
                        <input 
                            name="confirmPassword"
                            type="password"
                            placeholder="Konfirmasi Password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none"
                        />
                    )}
                </>
            )}

            {mode !== 'verify' && mode !== 'success_reg' && (
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
                </button>
            )}
          </form>

          {mode !== 'verify' && mode !== 'success_reg' && (
            <div className="mt-6 text-center text-xs">
                <p className="text-zinc-500">
                    {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                    <button 
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-white font-bold hover:text-red-500 underline underline-offset-4"
                    >
                        {mode === 'login' ? 'Daftar Sekarang' : 'Login Disini'}
                    </button>
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
