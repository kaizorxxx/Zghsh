
import React, { useState, useEffect, useRef } from 'react';
import { firebaseService as supabase } from '../services/firebase';

interface VideoPlayerProps {
  poster: string;
  streamUrl?: string | null;
  onEnded?: () => void;
  overlay?: React.ReactNode;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ poster, streamUrl, onEnded, overlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPauseAd, setShowPauseAd] = useState(false);
  const [hasWatchedPreroll, setHasWatchedPreroll] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const adsConfig = supabase.getAds();

  // Reset loading state when stream URL changes
  useEffect(() => {
    setIsLoaded(false);
    setError(false);
    setShowPauseAd(false);
  }, [streamUrl]);

  const isDirectStream = (url: string) => {
      return url.match(/\.(mp4|mkv|webm|ogg|m3u8)$/i) !== null;
  };

  useEffect(() => {
    if (streamUrl && isPlaying && videoRef.current && !error && !showPauseAd) {
        videoRef.current.load();
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, [streamUrl, isPlaying, error, showPauseAd]);

  const handlePlayClick = () => {
      // Logic for Preroll / First Click Ad
      if (adsConfig.enabled && adsConfig.showPreroll && !hasWatchedPreroll) {
          window.open(adsConfig.popunderLink || 'https://google.com', '_blank');
          supabase.incrementAdClick(); // Track click
          setHasWatchedPreroll(true);
          return;
      }
      setIsPlaying(true);
  };

  const handleVideoPause = () => {
      if (adsConfig.enabled && adsConfig.showPauseAd) {
          setShowPauseAd(true);
      }
  };

  const handleVideoPlay = () => {
      setShowPauseAd(false);
  };

  const closePauseAd = (e: React.MouseEvent) => {
      e.stopPropagation();
      supabase.incrementAdClick(); // Track click (assuming close is an interaction or leads to target)
      setShowPauseAd(false);
      videoRef.current?.play();
  };

  const handleVideoError = () => {
      console.warn("Direct Playback Failed. Switching to Embed Mode.");
      setError(true);
      setIsLoaded(true);
  };

  const renderPlayer = () => {
      if (!streamUrl) return null;

      const useIframe = !isDirectStream(streamUrl) || error;

      if (useIframe) {
          return (
              <iframe 
                  src={streamUrl} 
                  className={`w-full h-full border-0 bg-black absolute inset-0 z-10 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                  allow="accelerometer; autoplay *; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen *" 
                  allowFullScreen
                  title="Stream Content"
                  onLoad={() => setIsLoaded(true)}
              />
          );
      }

      return (
          <video 
            ref={videoRef}
            className={`w-full h-full object-contain absolute inset-0 z-10 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            controls
            playsInline
            src={streamUrl}
            poster={poster}
            onEnded={onEnded}
            onPause={handleVideoPause}
            onPlay={handleVideoPlay}
            onError={handleVideoError}
            onLoadedData={() => setIsLoaded(true)}
            crossOrigin="anonymous"
        >
            <source src={streamUrl} type="video/mp4" />
            <p className="text-white">Browser Anda tidak mendukung pemutaran video ini.</p>
        </video>
      );
  };

  return (
    <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden bg-black border border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.9)] group isolate">
      
      {/* SCANLINE EFFECT DURING LOAD */}
      {isPlaying && !isLoaded && <div className="scanline"></div>}

      {/* 1. BACKGROUND POSTER */}
      <img 
        src={poster} 
        alt="Player background" 
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 z-0 ${isPlaying ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-40 scale-100 group-hover:scale-105'}`}
      />

      {/* 2. OVERLAY CONTENT (Subtitle/Next Ep) */}
      {overlay && !showPauseAd && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fadeIn">
          {overlay}
        </div>
      )}

      {/* 3. PAUSE AD BANNER */}
      {showPauseAd && (
          <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fadeIn p-4">
              <div className="relative bg-zinc-900 border border-red-600/30 p-2 rounded-xl max-w-lg w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                  <div className="bg-black/50 aspect-[300/250] flex items-center justify-center mb-2 rounded-lg">
                      <p className="text-zinc-500 text-xs font-mono">[ PAUSE AD: 300x250 ]</p>
                  </div>
                  <button 
                    onClick={closePauseAd}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-3 rounded-lg text-xs transition-colors"
                  >
                      Tutup Iklan & Lanjutkan
                  </button>
              </div>
          </div>
      )}

      {/* 4. PLAYER CONTROLS & VIDEO */}
      {!isPlaying ? (
        <div className="absolute inset-0 flex items-center justify-center z-20 animate-fadeIn">
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"></div>
          <div className="relative flex flex-col items-center">
            <button 
              onClick={handlePlayClick}
              className="w-28 h-28 bg-red-600 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_60px_rgba(220,38,38,0.6)] z-20 group/play"
            >
              <div className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover/play:scale-110 transition-transform duration-700"></div>
              <svg className="w-12 h-12 text-white translate-x-1 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
            {!hasWatchedPreroll && adsConfig.enabled && adsConfig.showPreroll && (
                <p className="mt-4 text-[10px] text-zinc-400 font-bold uppercase tracking-widest animate-pulse">Klik untuk membuka akses</p>
            )}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-black z-30 flex items-center justify-center">
            {!isLoaded && (
                <div className="text-center space-y-6 animate-fadeInUp p-8 relative z-40">
                    <div className="w-14 h-14 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                    <div className="space-y-2">
                        <p className="text-red-500 font-orbitron font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">
                            MEMUAT STREAM...
                        </p>
                    </div>
                </div>
            )}
            
            <div className={`w-full h-full relative ${isLoaded ? 'animate-fadeIn' : 'hidden'}`}>
                {renderPlayer()}
            </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
