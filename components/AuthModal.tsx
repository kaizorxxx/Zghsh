
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>(initialMode);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const res = supabase.login(form.email, form.password); // form.email handles username/phone too
        if (res.success) {
          onLoginSuccess();
          onClose();
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
        if (!form.phoneNumber || !form.email) {
             setError("Email dan Nomor HP wajib diisi.");
             setLoading(false);
             return;
        }

        const res = supabase.register({
            username: form.username,
            email: form.email,
            phoneNumber: form.phoneNumber,
            password: form.password
        });

        if (res.success) {
            setMode('verify'); // Move to verify step
        } else {
            setError(res.message);
        }
      } 
      else if (mode === 'verify') {
        const success = supabase.verifyUser(form.email, form.code);
        if (success) {
            onLoginSuccess();
            onClose();
        } else {
            setError("Kode verifikasi salah! (Coba: 1234)");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
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
            {mode === 'login' ? 'Akses Sistem' : mode === 'signup' ? 'Daftar Anggota' : 'Verifikasi Identitas'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-xs font-bold mb-4 text-center">
                {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'verify' ? (
                <div className="space-y-2">
                    <p className="text-xs text-zinc-400 text-center mb-4">Masukkan kode yang dikirim ke {form.email} atau {form.phoneNumber}. <br/>(Hint: 1234)</p>
                    <input 
                        name="code"
                        placeholder="Kode Verifikasi (contoh: 1234)"
                        value={form.code}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none text-center tracking-[0.5em] font-black text-xl"
                    />
                </div>
            ) : (
                <>
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
                            placeholder="Email / Username / No. HP"
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

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : mode === 'signup' ? 'Daftar' : 'Verifikasi'}
            </button>
          </form>

          {mode !== 'verify' && (
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
