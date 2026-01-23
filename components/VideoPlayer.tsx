
import React, { useState, useEffect } from 'react';

interface VideoPlayerProps {
  poster: string;
  streamUrl?: string | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ poster, streamUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  useEffect(() => {
    if (isPlaying) {
      setIsBuffering(true);
      const timer = setTimeout(() => setIsBuffering(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, streamUrl]);

  return (
    <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden glass border-white/10 neon-border shadow-2xl group">
      {!isPlaying ? (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px]"></div>
          <div className="relative flex flex-col items-center">
            <button 
              onClick={() => setIsPlaying(true)}
              className="w-32 h-32 bg-cyan-400 rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-[0_0_60px_rgba(34,211,238,0.6)] group/btn z-20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 skew-x-[30deg]"></div>
              <svg className="w-12 h-12 text-slate-950 translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
            <p className="mt-8 font-orbitron font-black text-cyan-400 text-xs tracking-[0.6em] animate-pulse">INITIATE UPLINK</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-slate-950 z-10 flex items-center justify-center">
            {isBuffering || !streamUrl ? (
                <div className="text-center space-y-8 relative z-20">
                    <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border border-fuchsia-500/40 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                    </div>
                    <div>
                        <p className="text-cyan-400 font-orbitron font-black text-sm animate-pulse tracking-[0.4em] mb-4">
                            {!streamUrl ? 'RESOLVING DATA PACKETS...' : 'DECRYPTING STREAM...'}
                        </p>
                        <div className="w-80 h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[loading_1.5s_linear_infinite]"></div>
                        </div>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <span className="text-[10px] font-mono text-slate-500">BUFFER: {isBuffering ? 'QUEUED' : 'ACTIVE'}</span>
                        <span className="text-[10px] font-mono text-slate-500">BITRATE: AUTO-MAX</span>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full relative">
                    <video 
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        src={streamUrl}
                        poster={poster}
                    />
                    {/* Retro-futuristic scanlines overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
                </div>
            )}
        </div>
      )}
      
      <img 
        src={poster} 
        alt="Player background" 
        className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-1000"
      />

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Cinematic HUD Elements */}
      <div className="absolute top-8 left-8 flex gap-6 z-30 pointer-events-none">
          <div className="flex flex-col items-center">
              <div className="w-0.5 h-12 bg-gradient-to-b from-cyan-400 to-transparent"></div>
              <span className="text-[8px] font-mono text-cyan-400 rotate-90 origin-left translate-x-2 mt-4">AXIS_Y</span>
          </div>
          <div>
            <div className="text-[10px] font-orbitron font-black text-white/50 tracking-widest uppercase">Nova Core V9.4</div>
            <div className="flex gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
            </div>
          </div>
      </div>

      <div className="absolute bottom-8 right-8 text-right z-30 pointer-events-none">
          <div className="text-[8px] font-mono text-fuchsia-400 mb-2">COORD: 34.221 / -118.432</div>
          <div className="w-48 h-1 bg-white/10 relative overflow-hidden">
             <div className="absolute inset-0 bg-fuchsia-400/40 w-1/3 animate-[loading_4s_ease-in-out_infinite]"></div>
          </div>
          <div className="text-[10px] font-orbitron text-white/40 mt-2 uppercase tracking-tighter">Transmission Integrity Secured</div>
      </div>
    </div>
  );
};

export default VideoPlayer;
