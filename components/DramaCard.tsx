
import React from 'react';
import { Link } from 'react-router-dom';
import { Drama } from '../types';

interface DramaCardProps {
  drama: Drama;
}

const DramaCard: React.FC<DramaCardProps> = ({ drama }) => {
  return (
    <Link to={`/drama/${drama.id}?source=${drama.source}`} className="group block mb-4">
      <div className="relative aspect-[12/17] overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-red-600 transition-colors">
        <img 
          src={drama.thumbnail} 
          alt={drama.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* "Nyhet" Tag */}
        {Math.random() > 0.6 && (
           <div className="ribbon-red">Nyhet</div>
        )}
        
        {/* Hover overlay for quick info */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
            </div>
        </div>
      </div>
      
      <div className="mt-3 space-y-0.5 px-0.5">
        <h3 className="text-sm font-bold text-white truncate group-hover:text-red-500 transition-colors uppercase tracking-tight">
            {drama.title}
        </h3>
        <p className="text-[10px] text-zinc-500 font-medium uppercase truncate">
            {drama.genre[0]} / {drama.source}
        </p>
        <p className="text-[10px] text-zinc-600 font-bold">
            {drama.releaseYear}
        </p>
      </div>
    </Link>
  );
};

export default DramaCard;