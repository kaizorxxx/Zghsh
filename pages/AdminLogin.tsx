
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded for demo purposes as requested
    if (username === 'admin' && password === 'admin123') {
        navigate('/admin');
    } else {
        setError('ACCESS DENIED: Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black"></div>
        <div className="absolute w-full h-full opacity-20 bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative z-10 w-full max-w-md bg-zinc-950 border border-white/10 p-10 rounded-[2rem] shadow-[0_0_100px_rgba(220,38,38,0.2)]">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-red-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h1 className="text-2xl font-orbitron font-black text-white tracking-widest uppercase">Admin Terminal</h1>
                <p className="text-[10px] text-zinc-500 font-mono mt-2">RESTRICTED ACCESS LEVEL 9</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-900/20 border border-red-500 text-red-500 text-center py-2 px-4 rounded text-xs font-bold font-mono animate-pulse">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Identifier</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono focus:border-red-600 outline-none transition-all"
                        placeholder="usr_admin"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Passkey</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono focus:border-red-600 outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-red-600 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]"
                >
                    Authenticate
                </button>
            </form>
        </div>
    </div>
  );
};

export default AdminLogin;
