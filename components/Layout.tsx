
import React from 'react';
import Header from './Header';
import { UserProfile, AdConfig } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  adConfig: AdConfig;
}

const Layout: React.FC<LayoutProps> = ({ children, user, adConfig }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header user={user} />
      
      <main className="flex-grow container mx-auto px-6 py-12">
        {children}
      </main>

      <footer className="bg-black pt-20 pb-12 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
               <span className="text-red-600 font-orbitron font-black text-2xl tracking-tighter">NOVAANIME</span>
               <div className="w-[1px] h-6 bg-zinc-800 hidden md:block"></div>
               <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Powered by Sansekai Nodes © 2024</span>
            </div>
            <div className="flex items-center gap-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
               <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
               <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
               <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
               <span className="hover:text-red-500 cursor-pointer transition-colors font-bold text-red-600">Join Community</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
