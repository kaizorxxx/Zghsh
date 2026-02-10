
import React, { useState, useEffect } from 'react';
import Header from './Header';
import { UserProfile, AdConfig } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  adConfig: AdConfig;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, adConfig, onOpenAuth, onLogout }) => {
  const [showCustomPopup, setShowCustomPopup] = useState(false);

  useEffect(() => {
    // Show custom popup if enabled and not closed in session
    if (adConfig.customPopupEnabled && adConfig.customPopupImage) {
        const hasSeen = sessionStorage.getItem('seen_custom_popup');
        if (!hasSeen) {
            // Delay slightly for effect
            const timer = setTimeout(() => setShowCustomPopup(true), 2000);
            return () => clearTimeout(timer);
        }
    }
  }, [adConfig]);

  const closePopup = () => {
      setShowCustomPopup(false);
      sessionStorage.setItem('seen_custom_popup', 'true');
  };

  const handlePopupClick = () => {
      if (adConfig.customPopupUrl) {
          window.open(adConfig.customPopupUrl, '_blank');
      }
      closePopup();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-x-hidden">
      <Header user={user} onOpenAuth={onOpenAuth} onLogout={onLogout} />
      
      {/* GLOBAL CUSTOM POPUP */}
      {showCustomPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="relative max-w-lg w-full">
                  <button 
                    onClick={closePopup}
                    className="absolute -top-4 -right-4 w-8 h-8 bg-red-600 rounded-full text-white font-bold flex items-center justify-center shadow-lg z-10"
                  >
                      ✕
                  </button>
                  <div 
                    onClick={handlePopupClick}
                    className="cursor-pointer rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)] border border-white/10"
                  >
                      <img src={adConfig.customPopupImage} className="w-full h-auto" alt="Promo" />
                  </div>
              </div>
          </div>
      )}

      {/* Top Banner Ad */}
      {adConfig.enabled && adConfig.showTopBanner && (
        <div className="w-full bg-zinc-900/50 h-24 hidden md:flex items-center justify-center border-b border-white/5 relative group cursor-pointer overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <p className="text-zinc-600 text-xs font-mono tracking-widest">[ SPACE IKLAN TOP BANNER ]</p>
             <p className="absolute bottom-1 right-2 text-[8px] text-zinc-700">Ad ID: {adConfig.interstitialId}</p>
        </div>
      )}

      <div className="flex flex-grow relative">
          {/* Left Sidebar Ad (Desktop Only) */}
          {adConfig.enabled && adConfig.showSidebars && (
             <div className="hidden xl:flex w-[160px] sticky top-20 h-[calc(100vh-80px)] border-r border-white/5 items-center justify-center bg-zinc-950/30">
                 <div className="rotate-90 text-zinc-700 text-[10px] font-black tracking-[0.5em] whitespace-nowrap">IKLAN SISI KIRI</div>
             </div>
          )}

          <main className="flex-grow container mx-auto px-4 sm:px-6 py-12 w-full max-w-[1600px]">
            {children}
          </main>

          {/* Right Sidebar Ad (Desktop Only) */}
          {adConfig.enabled && adConfig.showSidebars && (
             <div className="hidden xl:flex w-[160px] sticky top-20 h-[calc(100vh-80px)] border-l border-white/5 items-center justify-center bg-zinc-950/30">
                 <div className="-rotate-90 text-zinc-700 text-[10px] font-black tracking-[0.5em] whitespace-nowrap">IKLAN SISI KANAN</div>
             </div>
          )}
      </div>

      <footer className="bg-black pt-20 pb-12 border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
               <span className="text-red-600 font-orbitron font-black text-2xl tracking-tighter">NOVAANIME</span>
               <div className="w-[1px] h-6 bg-zinc-800 hidden md:block"></div>
               <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Powered by Sansekai Nodes © 2024</span>
            </div>
            <div className="flex items-center gap-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
               <span className="hover:text-white cursor-pointer transition-colors">Privasi</span>
               <span className="hover:text-white cursor-pointer transition-colors">Syarat & Ketentuan</span>
               <span className="hover:text-white cursor-pointer transition-colors">Kontak</span>
               <span className="hover:text-red-500 cursor-pointer transition-colors font-bold text-red-600">Gabung Komunitas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
