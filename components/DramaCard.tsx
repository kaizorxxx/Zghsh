
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimeItem } from '../types';

interface DramaCardProps {
  drama: AnimeItem;
}

const DramaCard: React.FC<DramaCardProps> = ({ drama }) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Fallback visual generator (Gradient based on title length to create variety)
  const getGradient = (str: string) => {
      const colors = [
          'from-red-900 to-black',
          'from-blue-900 to-black',
          'from-purple-900 to-black',
          'from-emerald-900 to-black',
          'from-amber-900 to-black'
      ];
      const index = str.length % colors.length;
      return colors[index];
  };

  const initialImage = drama.image || drama.thumbnail;

  return (
    <Link to={`/drama/${drama.slug}`} className="group block mb-2 h-full">
      <div className="relative w-full aspect-[12/17] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-red-600 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(225,29,72,0.3)] group-hover:-translate-y-2">
        
        {/* State: Loading Shimmer */}
        {imageState === 'loading' && (
            <div className="absolute inset-0 shimmer bg-zinc-800 z-10"></div>
        )}

        {/* State: Error / No Image -> Render CSS Fallback */}
        {(imageState === 'error' || !initialImage) && (
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(drama.title)} flex flex-col items-center justify-center p-4 text-center z-0`}>
                <div className="w-12 h-12 mb-2 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl font-black text-white/50 font-orbitron">
                        {drama.title.charAt(0).toUpperCase()}
                    </span>
                </div>
                <h4 className="text-[10px] font-black text-white/70 uppercase tracking-widest line-clamp-3">
                    {drama.title}
                </h4>
            </div>
        )}
        
        {/* Main Image */}
        {initialImage && imageState !== 'error' && (
            <img 
            src={initialImage} 
            alt={drama.title} 
            loading="lazy"
            onLoad={() => setImageState('loaded')}
            onError={() => setImageState('error')}
            className={`w-full h-full object-cover transition-all duration-1000 ${imageState === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} group-hover:scale-110 relative z-0`}
            />
        )}
        
        {/* Cinematic HUD elements */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20 group-hover:opacity-40 transition-opacity z-10"></div>

        {/* Episode Badge */}
        <div className="absolute top-2 right-2 z-20 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
            <span className="text-[10px] font-black text-red-500">EP {drama.episode || drama.latest_episode || '?'}</span>
        </div>

        {/* Type Tag */}
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-red-600 rounded-md shadow-lg transform -translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
            <span className="text-[8px] font-black text-white uppercase tracking-wider">
                {drama.type || 'TV'}
            </span>
        </div>
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-20">
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.6)] scale-50 group-hover:scale-100 transition-transform duration-500">
                <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                </svg>
            </div>
        </div>
      </div>
      
      <div className="mt-3 px-1 space-y-1">
        <h3 className="text-[11px] sm:text-[13px] font-black text-white truncate group-hover:text-red-500 transition-colors uppercase tracking-tight italic">
            {drama.title}
        </h3>
        <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{drama.type || 'Show'}</span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{drama.release_time || 'Unknown'}</span>
        </div>
      </div>
    </Link>
  );
};

export default DramaCard;
