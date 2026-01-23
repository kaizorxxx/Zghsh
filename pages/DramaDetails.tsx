
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchDramaById, getVideoStream } from '../services/api';
import { getAiSuggestions } from '../services/gemini';
import { Drama, UserProfile } from '../types';
import VideoPlayer from '../components/VideoPlayer';

interface DramaDetailsProps {
  user: UserProfile;
}

const DramaDetails: React.FC<DramaDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const source = (searchParams.get('source') as 'Dramabox' | 'Melolo') || 'Dramabox';
  
  const [drama, setDrama] = useState<Drama | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('Booting AI Critic Neural-Link...');
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(1);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadDrama = async () => {
      setLoading(true);
      try {
        const data = await fetchDramaById(id, source);
        if (data) {
          setDrama(data);
          // Start stream resolving
          const stream = await getVideoStream(id, 1, source);
          setStreamUrl(stream);
          
          // Parallel AI Analysis
          getAiSuggestions(data.title).then(setAiAnalysis);
        }
      } catch (e) {
        console.error("Load failed", e);
      } finally {
        setLoading(false);
      }
    };
    loadDrama();
  }, [id, source]);

  const handleChapterSelect = async (index: number) => {
    if (!id) return;
    setActiveChapter(index);
    setStreamUrl(null); // Reset for loading state
    const stream = await getVideoStream(id, index, source);
    setStreamUrl(stream);
  };

  if (loading || !drama) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-64 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
          <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 animate-[loading_2s_linear_infinite] shadow-[0_0_10px_cyan]"></div>
        </div>
        <p className="mt-8 font-orbitron text-[10px] text-slate-500 uppercase tracking-[0.5em] animate-pulse">Accessing Core Archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Dynamic Player Area */}
      <VideoPlayer poster={drama.thumbnail} streamUrl={streamUrl} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Cinematic Content Information */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end gap-8 justify-between">
            <div className="space-y-4">
              <div className="flex gap-3">
                {drama.genre.map(g => (
                  <span key={g} className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-4 py-1.5 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-6xl font-orbitron font-black text-white drop-shadow-lg">{drama.title}</h1>
              <div className="flex items-center gap-8 mt-4 text-slate-400 font-mono text-sm">
                <span className="flex items-center gap-2 text-cyan-400 font-bold"><span className="text-xl">★</span> {drama.rating}</span>
                <span className="bg-slate-900 px-3 py-1 rounded-lg border border-white/5">{drama.episodes || drama.chapters?.length || '??'} PHASES</span>
                <span className="text-fuchsia-400 font-black uppercase tracking-widest text-[10px] px-3 py-1 bg-fuchsia-400/10 rounded-lg border border-fuchsia-400/20">
                  SRC: {drama.source}
                </span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button className="p-5 glass rounded-3xl hover:bg-fuchsia-500/20 group transition-all border-fuchsia-400/10 active:scale-95">
                <svg className="w-6 h-6 text-fuchsia-400 group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-5 glass rounded-3xl hover:bg-cyan-500/20 group transition-all border-cyan-400/10 active:scale-95">
                <svg className="w-6 h-6 text-cyan-400 group-hover:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-transparent rounded-full opacity-50"></div>
            <p className="text-slate-400 text-xl leading-relaxed pl-8 font-light italic">
              "{drama.description}"
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="font-orbitron font-black text-white text-2xl flex items-center gap-4">
                  <span className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_cyan] animate-pulse"></span>
                  Transmission Phases
                </h3>
                <span className="text-[10px] font-mono text-slate-500">SYNCED: 2077.05.12</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-4">
              {Array.from({ length: Math.max(drama.episodes, (drama.chapters?.length || 0)) }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => handleChapterSelect(i + 1)}
                  className={`aspect-square rounded-2xl flex items-center justify-center font-black transition-all border-2 text-sm group ${
                    activeChapter === (i + 1) 
                      ? 'bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]' 
                      : 'glass text-slate-500 border-white/5 hover:border-cyan-400/40 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* High-Intelligence Analytics Sidebar */}
        <div className="space-y-10">
          <div className="glass rounded-[3rem] p-10 border-cyan-400/20 relative overflow-hidden group shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors"></div>
            <h3 className="font-orbitron font-black text-cyan-400 text-xs tracking-[0.5em] mb-8 flex items-center gap-3">
               GEMINI INTELLIGENCE <span className="text-[10px] bg-cyan-400/20 px-3 py-1 rounded-full text-cyan-100 border border-cyan-400/30">ONLINE</span>
            </h3>
            <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-slate-300 whitespace-pre-line leading-loose text-base font-light font-sans tracking-wide">
                  {aiAnalysis}
                </div>
            </div>
            <div className="mt-12 pt-10 border-t border-white/5 space-y-6">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-widest">
                    <span>NEURAL ANALYTIC CONFIDENCE</span>
                    <span className="text-cyan-400">98.42%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="w-[98.42%] h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-[0_0_15px_cyan]"></div>
                </div>
            </div>
          </div>

          <div className="glass rounded-[3rem] p-10 border-fuchsia-400/20 border-dashed">
             <h3 className="font-orbitron font-black text-fuchsia-400 text-[10px] tracking-[0.4em] mb-6 uppercase">Node Health Status</h3>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse"></div>
                    <span className="text-xs text-slate-300 font-mono">PRIMARY STREAM: OPTIMAL</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                    <span className="text-xs text-slate-300 font-mono">ENCRYPTION: QUANTUM 4096-BIT</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DramaDetails;
