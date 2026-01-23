
import React from 'react';
import { AdConfig } from '../types';

interface AdsContainerProps {
  config: AdConfig;
  type: 'in-page' | 'interstitial';
}

const AdsContainer: React.FC<AdsContainerProps> = ({ config, type }) => {
  if (!config.enabled) return null;

  return (
    <div className="w-full my-6 flex justify-center">
      <div className="w-full max-w-4xl p-10 glass border-dashed border-cyan-400/30 rounded-3xl flex flex-col items-center justify-center text-center">
        <div className="text-cyan-400 text-xs font-orbitron tracking-widest mb-2 opacity-50">PROMOTIONAL TRANSMISSION</div>
        <div className="bg-slate-900/50 w-full h-24 rounded-xl flex items-center justify-center">
          <p className="text-slate-500 font-mono text-xs italic">
            [Monetag Ad Integration: {type === 'in-page' ? config.monetagId : config.interstitialId}]
          </p>
        </div>
        <div className="mt-4 flex gap-4">
            <span className="text-[10px] text-fuchsia-400/50 border border-fuchsia-400/20 px-2 py-0.5 rounded">Target: All Non-VIPs</span>
            <span className="text-[10px] text-fuchsia-400/50 border border-fuchsia-400/20 px-2 py-0.5 rounded">Status: Broadcast Active</span>
        </div>
      </div>
    </div>
  );
};

export default AdsContainer;
