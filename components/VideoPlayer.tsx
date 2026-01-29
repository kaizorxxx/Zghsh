
import React, { useState, useEffect } from 'react';

interface VideoPlayerProps {
  poster: string;
  streamUrl?: string | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ poster, streamUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Instant trigger if isPlaying is already true and a new URL comes in
  useEffect(() => {
    if (streamUrl && isPlaying) {
      // Small timeout to allow DOM to catch up for seamless switching
      const timer = setTimeout(() => setShowControls(true), 50);
      return () => clearTimeout(timer);
    }
  }, [streamUrl, isPlaying]);

  return (
    <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-black border border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.8)] group">
      {!isPlaying ? (
        <div className="absolute inset-0 flex items-center justify-center z-20 transition-all duration-700">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"></div>
          <div className="relative flex flex-col items-center">
            <button 
              onClick={() => setIsPlaying(true)}
              className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_50px_rgba(220,38,38,0.5)] z-20"
            >
              <svg className="w-10 h-10 text-white translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
            <p className="mt-8 font-orbitron font-black text-red-600 text-[10px] tracking-[0.8em] animate-pulse uppercase italic">Mulai Transmisi</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-black z-10 flex items-center justify-center">
            {(!streamUrl) ? (
                <div className="text-center space-y-6 animate-fadeInUp">
                    <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-zinc-600 font-orbitron font-black text-[9px] animate-pulse tracking-[0.4em] uppercase">
                        MENGAMBIL DATA STREAM...
                    </p>
                </div>
            ) : (
                <div className="w-full h-full relative animate-[fadeIn_0.5s_ease-out]">
                    <video 
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        src={streamUrl}
                        poster={poster}
                    />
                    {/* Cinematic Overlay Scanlines */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-10"></div>
                </div>
            )}
        </div>
      )}
      
      {/* Background Poster (Dimmed) */}
      <img 
        src={poster} 
        alt="Player background" 
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${isPlaying ? 'opacity-0 scale-110' : 'opacity-30 scale-100'}`}
      />

      {/* Dynamic HUD */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
            <div className="text-[9px] font-orbitron font-black text-white/50 tracking-[0.4em] uppercase italic">NOVA_STREAM_V3</div>
          </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
