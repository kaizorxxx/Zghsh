import React, { useState, useEffect, useRef } from 'react';

interface VideoPlayerProps {
  poster: string;
  streamUrl?: string | null;
  onEnded?: () => void;
  overlay?: React.ReactNode;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ poster, streamUrl, onEnded, overlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper: Cek ekstensi file
  const isDirectStream = (url: string) => {
      return url.match(/\.(mp4|mkv|webm|ogg|m3u8)$/i) !== null;
  };

  useEffect(() => {
    setIsPlaying(false);
    setError(false);
  }, [streamUrl]);

  useEffect(() => {
    if (streamUrl && isPlaying && videoRef.current && !error) {
        videoRef.current.load();
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, [streamUrl, isPlaying, error]);

  const handleVideoError = () => {
      console.warn("Direct Playback Failed. Switching to Embed Mode.");
      setError(true);
  };

  const renderPlayer = () => {
      if (!streamUrl) return null;

      // Jika bukan file langsung (mp4) ATAU sudah error di mode video tag -> Pakai Iframe
      const useIframe = !isDirectStream(streamUrl) || error;

      if (useIframe) {
          return (
              <iframe 
                  src={streamUrl} 
                  className="w-full h-full border-0 bg-black absolute inset-0 z-10"
                  allow="accelerometer; autoplay *; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen *" 
                  allowFullScreen
                  title="Stream Content"
              />
          );
      }

      return (
          <video 
            ref={videoRef}
            className="w-full h-full object-contain absolute inset-0 z-10"
            controls
            autoPlay
            playsInline
            src={streamUrl}
            poster={poster}
            onEnded={onEnded}
            onError={handleVideoError}
            crossOrigin="anonymous"
        >
            <source src={streamUrl} type="video/mp4" />
            <p className="text-white">Browser Anda tidak mendukung tag video.</p>
        </video>
      );
  };

  return (
    <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden bg-black border border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.9)] group isolate">
      
      {/* 1. LAYER PALING BELAKANG: BACKGROUND POSTER */}
      <img 
        src={poster} 
        alt="Player background" 
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 z-0 ${isPlaying ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-40 scale-100 group-hover:scale-105'}`}
      />

      {/* 2. LAYER TENGAH: OVERLAY CONTENT (Subtitle/Next Ep) */}
      {overlay && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fadeInUp">
          {overlay}
        </div>
      )}

      {/* 3. LAYER DEPAN: PLAYER CONTROLS & VIDEO */}
      {!isPlaying ? (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"></div>
          <div className="relative flex flex-col items-center">
            <button 
              onClick={() => setIsPlaying(true)}
              className="w-28 h-28 bg-red-600 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_60px_rgba(220,38,38,0.6)] z-20 group/play"
            >
              <div className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover/play:scale-110 transition-transform duration-700"></div>
              <svg className="w-12 h-12 text-white translate-x-1 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
            <p className="mt-10 font-orbitron font-black text-red-600 text-[10px] tracking-[0.8em] animate-pulse uppercase italic relative z-20">
                {streamUrl ? "SYSTEM ONLINE" : "OFFLINE"}
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-black z-30 flex items-center justify-center">
            {(!streamUrl) ? (
                <div className="text-center space-y-6 animate-fadeInUp p-8 relative z-40">
                    <div className="w-14 h-14 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div className="space-y-2">
                        <p className="text-red-500 font-orbitron font-black text-[10px] uppercase tracking-[0.2em]">
                            CONNECTING TO NODE...
                        </p>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full relative animate-[fadeIn_0.4s_ease-out]">
                    {renderPlayer()}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;