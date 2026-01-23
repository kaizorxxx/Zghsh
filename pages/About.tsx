
import React from 'react';

const LEGENDS = [
  {
    name: 'Elon Musk',
    title: 'Architect of Neural Space',
    image: 'https://picsum.photos/seed/musk/400/400',
    quote: 'The future of streaming is neuro-synced.',
    color: 'border-cyan-400'
  },
  {
    name: 'Steve Jobs',
    title: 'Father of Digital Elegance',
    image: 'https://picsum.photos/seed/jobs/400/400',
    quote: 'Design is not just what it looks like, it is how it streams.',
    color: 'border-fuchsia-400'
  },
  {
    name: 'Mark Zuckerberg',
    title: 'Chief of Social Convergence',
    image: 'https://picsum.photos/seed/mark/400/400',
    quote: 'The metaverse is just a longer C-Drama.',
    color: 'border-purple-400'
  }
];

const About: React.FC = () => {
  return (
    <div className="space-y-20 py-12">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-6xl font-orbitron font-black text-white leading-tight">
          ARCHITECTS OF <span className="text-cyan-400">INNOVATION</span>
        </h1>
        <p className="text-slate-400 text-lg">
          NovaDrama is built on the ideological pillars of the digital ancients. 
          We celebrate the legends who turned science fiction into reality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {LEGENDS.map((legend, idx) => (
          <div key={idx} className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-[3rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass rounded-[3rem] p-10 text-center flex flex-col items-center space-y-6">
              <div className="relative">
                <img 
                  src={legend.image} 
                  alt={legend.name} 
                  className={`w-40 h-40 rounded-full object-cover border-4 ${legend.color} shadow-2xl`}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full border-4 border-slate-950 flex items-center gap-1 shadow-lg shadow-green-500/50">
                   <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                   APPROVED
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-orbitron font-bold text-white">{legend.name}</h3>
                <p className="text-xs text-cyan-400 uppercase tracking-[0.2em] mt-1">{legend.title}</p>
              </div>
              <p className="text-slate-400 text-sm italic leading-relaxed">
                "{legend.quote}"
              </p>
              <div className="pt-6 w-full flex justify-center">
                 <div className="flex gap-1">
                    {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className={`w-1 h-8 rounded-full ${i < 4 ? 'bg-cyan-400' : 'bg-slate-800'}`}></div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="glass rounded-[4rem] p-20 relative overflow-hidden border-white/5">
         <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-fuchsia-500/5"></div>
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <h2 className="text-4xl font-orbitron font-black text-white">THE NOVA MANIFESTO</h2>
               <p className="text-slate-400 leading-loose">
                  Streaming is no longer a passive act. In the year 2077, your entertainment is an extension of your neural identity. 
                  By utilizing Dramabox and Melolo neural-nodes, we ensure zero-latency storytelling across all quadrants of the metaverse.
               </p>
               <div className="flex gap-8">
                  <div className="text-center">
                     <p className="text-3xl font-orbitron font-black text-cyan-400">12.5 PB</p>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Data Processed</p>
                  </div>
                  <div className="text-center">
                     <p className="text-3xl font-orbitron font-black text-fuchsia-400">0.001ms</p>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Global Latency</p>
                  </div>
               </div>
            </div>
            <div className="relative">
               <div className="aspect-square bg-white/5 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
                  <div className="absolute inset-8 border border-cyan-400/20 rounded-full animate-[spin_10s_linear_infinite_reverse]"></div>
                  <div className="w-24 h-24 bg-cyan-400 rounded-3xl rotate-45 flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.4)]">
                     <span className="text-slate-950 font-orbitron font-black text-4xl -rotate-45">N</span>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default About;
