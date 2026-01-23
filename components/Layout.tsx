
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
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-zinc-950 pt-16 pb-8 border-t border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16 text-zinc-500">
            <div className="space-y-4">
                <h4 className="text-white font-bold text-sm uppercase">TV</h4>
                <ul className="text-xs space-y-2">
                    <li>Rekommenderat</li>
                    <li>Mest populära</li>
                    <li>Nyttikommna</li>
                    <li>Premiärer</li>
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="text-white font-bold text-sm uppercase">Film</h4>
                <ul className="text-xs space-y-2">
                    <li>Rekommenderat</li>
                    <li>Mest populära</li>
                    <li>Nyttikommna</li>
                    <li>Premiärer</li>
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="text-white font-bold text-sm uppercase">Sport</h4>
                <ul className="text-xs space-y-2">
                    <li>Live sport</li>
                    <li>Live schema</li>
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="text-white font-bold text-sm uppercase">Viaplay</h4>
                <ul className="text-xs space-y-2">
                    <li>Kontakt</li>
                    <li>Press</li>
                    <li>Jobb</li>
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="text-white font-bold text-sm uppercase">Support</h4>
                <ul className="text-xs space-y-2">
                    <li>FAQ</li>
                    <li>Support</li>
                    <li>Devices</li>
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="text-white font-bold text-sm uppercase">System</h4>
                <ul className="text-xs space-y-2">
                    <li>Systemkrav</li>
                    <li>Cookies</li>
                    <li>Allmänna villkor</li>
                </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t border-zinc-900 pt-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
               <span className="text-red-600 font-orbitron font-black text-lg">NOVADRAMA</span>
               <span className="text-xs text-zinc-600">© 2077 Viaplay Nova. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-8 text-xs font-bold text-zinc-500 uppercase tracking-widest">
               <span className="hover:text-white cursor-pointer">Facebook</span>
               <span className="hover:text-white cursor-pointer">Twitter</span>
               <span className="hover:text-white cursor-pointer">Blog</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;