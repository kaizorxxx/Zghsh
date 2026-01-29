
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

  // Helper: Check if URL looks like an MP4/Direct stream or an Embed/HLS
  const isDirectStream = (url: string) => {
      return url.includes('.mp4') || url.includes('.mkv') || url.includes('.webm');
  };

  useEffect(() => {
    // Reset state when stream changes
    setIsPlaying(false);
    setError(false);
  }, [streamUrl]);

  useEffect(() => {
    // Auto-play logic if stream is available and user already clicked play previously
    if (streamUrl && isPlaying && videoRef.current && !error) {
        videoRef.current.load();
        videoRef.current.play().catch(e => {
            console.log("Autoplay blocked, user interaction required", e);
        });
    }
  }, [streamUrl, isPlaying, error]);

  const handleVideoError = () => {
      console.warn("Video tag failed to load (CORS or Format). Switching/Showing Error.");
      // Jika video tag gagal (mungkin karena CORS di direct link), kita bisa set Error state
      // Tapi jika ini adalah embed, UI iframe akan otomatis dirender di bawah
      setError(true);
  };

  // Determine if we should render an Iframe or a Video Tag
  const renderPlayer = () => {
      if (!streamUrl) return null;

      // Jika URL tidak terlihat seperti file video langsung, ATAU jika video tag error sebelumnya
      // Kita asumsikan ini adalah Embed Link (Iframe)
      const useIframe = !isDirectStream(streamUrl) || error;

      if (useIframe) {
          return (
              <iframe 
                  src={streamUrl} 
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  title="Stream Content"
                  // Iframe tidak memiliki event 'ended' yang bisa diakses karena cross-origin
                  // Jadi fitur auto-next mungkin tidak jalan untuk Iframe embed
              />
          );
      }

      return (
          <video 
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            autoPlay
            src={streamUrl}
            poster={poster}
            onEnded={onEnded}
            onError={handleVideoError}
            crossOrigin="anonymous" // Coba request dengan CORS header
        >
            <source src={streamUrl} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
      );
  };

  return (
    <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden bg-black border border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.9)] group">
      
      {/* Overlay: Auto-play countdown, Next Ep, etc */}
      {overlay && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fadeInUp">
          {overlay}
        </div>
      )}

      {!isPlaying ? (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-2xl"></div>
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
            <p className="mt-10 font-orbitron font-black text-red-600 text-[10px] tracking-[0.8em] animate-pulse uppercase italic">
                {streamUrl ? "DEKRIPSI STREAM SIAP" : "MENUNGGU JALUR DATA..."}
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-black z-10 flex items-center justify-center">
            {(!streamUrl) ? (
                <div className="text-center space-y-6 animate-fadeInUp">
                    <div className="w-14 h-14 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-zinc-600 font-orbitron font-black text-[9px] animate-pulse tracking-[0.4em] uppercase">
                        MENCARI SUMBER SINYAL TERBAIK...
                    </p>
                </div>
            ) : (
                <div className="w-full h-full relative animate-[fadeIn_0.4s_ease-out]">
                    
                    {/* Render Hybrid Player (Iframe or Video) */}
                    {renderPlayer()}

                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.03)_50%)] bg-[length:100%_4px] opacity-10"></div>
                    
                    {/* Watermark */}
                    <div className="absolute top-8 right-8 z-30 flex items-center gap-3 px-5 py-2.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/5 opacity-60 pointer-events-none">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
                        <span className="text-[9px] font-black text-white/90 uppercase tracking-[0.2em] italic">
                             {error ? 'EMBED_MODE' : 'DIRECT_FEED'}
                        </span>
                    </div>
                </div>
            )}
        </div>
      )}
      
      {/* Background Poster (Visible when not playing or loading) */}
      <img 
        src={poster} 
        alt="Player background" 
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${isPlaying ? 'opacity-0 scale-110' : 'opacity-40 scale-100 group-hover:scale-105'}`}
      />

      <div className="absolute bottom-8 left-10 z-30 pointer-events-none opacity-30">
        <div className="text-[10px] font-orbitron font-black text-white tracking-[0.5em] uppercase italic">NOVA_UPLINK_V2.1</div>
      </div>
    </div>
  );
};

export default VideoPlayer;
