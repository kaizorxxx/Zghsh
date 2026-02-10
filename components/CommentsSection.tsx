
import React, { useState, useEffect } from 'react';
import { firebaseService as supabase } from '../services/firebase';
import { Comment, UserProfile } from '../types';

interface CommentsSectionProps {
  animeSlug: string;
  user: UserProfile | null;
  onAuthReq: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ animeSlug, user, onAuthReq }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState('');
  const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});
  const [showReply, setShowReply] = useState<{ [id: string]: boolean }>({});
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
    if (user?.ratings && user.ratings[animeSlug]) {
        setRating(user.ratings[animeSlug]);
    }
  }, [animeSlug, user]);

  const loadComments = async () => {
    const data = await supabase.getComments(animeSlug);
    setComments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return onAuthReq();
    if (!input.trim()) return;

    setLoading(true);
    await supabase.addComment(animeSlug, input);
    setInput('');
    setLoading(false);
    loadComments();
  };

  const handleReply = async (commentId: string) => {
      if (!user) return onAuthReq();
      const content = replyInput[commentId];
      if (!content?.trim()) return;

      await supabase.addReply(commentId, content);
      setReplyInput(prev => ({...prev, [commentId]: ''}));
      setShowReply(prev => ({...prev, [commentId]: false}));
      loadComments();
  };

  const handleRate = async (star: number) => {
      if (!user) return onAuthReq();
      setRating(star);
      await supabase.rateAnime(animeSlug, star);
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
       {/* RATING SECTION */}
       <div className="glass p-6 rounded-3xl border-white/5 flex items-center justify-between">
           <div>
               <h3 className="font-orbitron font-bold text-white uppercase tracking-wider">Beri Rating</h3>
               <p className="text-[10px] text-zinc-500">Apa pendapatmu tentang anime ini?</p>
           </div>
           <div className="flex gap-2">
               {[1, 2, 3, 4, 5].map((star) => (
                   <button 
                     key={star}
                     onClick={() => handleRate(star)}
                     className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${rating >= star ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30' : 'bg-zinc-900 text-zinc-600 hover:text-white'}`}
                   >
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                   </button>
               ))}
           </div>
       </div>

       {/* COMMENTS SECTION */}
       <div className="glass p-8 rounded-[2rem] border-white/5 space-y-8">
           <h3 className="text-xl font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-3">
               <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
               Neural Chat ({comments.length})
           </h3>

           {/* Input */}
           <form onSubmit={handleSubmit} className="flex gap-4">
               <img src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'} className="w-10 h-10 rounded-full bg-zinc-800" />
               <div className="flex-grow relative">
                   <textarea 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     placeholder={user ? "Tulis komentar..." : "Login untuk berkomentar"}
                     className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-red-600 outline-none h-24 resize-none"
                     disabled={!user}
                   />
                   <button 
                     type="submit" 
                     disabled={loading || !user || !input.trim()}
                     className="absolute bottom-3 right-3 bg-white text-black text-[10px] font-black uppercase px-4 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                   >
                       Kirim
                   </button>
               </div>
           </form>

           {/* List */}
           <div className="space-y-6">
               {comments.map((comment) => (
                   <div key={comment.id} className="space-y-3">
                       <div className="flex gap-4 group">
                           <img src={comment.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-800" />
                           <div className="flex-grow space-y-1">
                               <div className="flex items-center gap-2">
                                   <span className="text-sm font-bold text-white">{comment.username}</span>
                                   <span className="text-[10px] text-zinc-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                               </div>
                               <p className="text-zinc-300 text-sm leading-relaxed">{comment.content}</p>
                               <button 
                                 onClick={() => setShowReply(prev => ({...prev, [comment.id]: !prev[comment.id]}))}
                                 className="text-[10px] font-bold text-zinc-500 hover:text-red-500 uppercase tracking-wider mt-1"
                               >
                                   Balas
                               </button>
                           </div>
                       </div>

                       {/* Replies */}
                       {comment.replies && comment.replies.map((reply, idx) => (
                           <div key={idx} className="flex gap-4 pl-14">
                               <img src={reply.avatar} className="w-8 h-8 rounded-full object-cover border border-zinc-800 opacity-80" />
                               <div className="flex-grow space-y-1">
                                   <div className="flex items-center gap-2">
                                       <span className="text-xs font-bold text-zinc-300">{reply.username}</span>
                                       <span className="text-[9px] text-zinc-600">{new Date(reply.timestamp).toLocaleDateString()}</span>
                                   </div>
                                   <p className="text-zinc-400 text-xs">{reply.content}</p>
                               </div>
                           </div>
                       ))}

                       {/* Reply Input */}
                       {showReply[comment.id] && (
                           <div className="pl-14 pt-2">
                               <div className="flex gap-3">
                                   <input 
                                     value={replyInput[comment.id] || ''}
                                     onChange={(e) => setReplyInput(prev => ({...prev, [comment.id]: e.target.value}))}
                                     placeholder="Balas komentar ini..."
                                     className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-red-600 outline-none"
                                   />
                                   <button 
                                     onClick={() => handleReply(comment.id)}
                                     className="bg-white text-black text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-red-600 hover:text-white"
                                   >
                                       Send
                                   </button>
                               </div>
                           </div>
                       )}
                   </div>
               ))}
               {comments.length === 0 && (
                   <p className="text-center text-zinc-600 text-xs italic">Belum ada transmisi data. Jadilah yang pertama.</p>
               )}
           </div>
       </div>
    </div>
  );
};

export default CommentsSection;
