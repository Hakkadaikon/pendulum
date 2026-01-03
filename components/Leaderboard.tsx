
import React from 'react';
import { X, Trophy, User, Hash, Loader2 } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, isLoading, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center space-x-3">
            <Trophy className="text-yellow-500" size={28} />
            <div>
              <h2 className="text-xl font-black italic tracking-tighter text-blue-500 leading-none">GLOBAL RANKING</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Nostr High Scores (Kind 30078)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {isLoading && entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
              <div className="flex flex-col items-center">
                <Loader2 size={48} className="mb-4 text-blue-500 animate-spin opacity-50" />
                <p className="font-bold tracking-[0.2em] text-[10px] text-zinc-500 animate-pulse">CONNECTING TO RELAYS...</p>
                <p className="text-[9px] text-zinc-600 mt-2">Searching for kind:30078 events</p>
              </div>
            </div>
          ) : !isLoading && entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
              <Hash size={48} className="mb-4 opacity-20" />
              <p className="font-bold tracking-widest text-xs uppercase">No records found</p>
              <p className="text-[9px] mt-2 text-zinc-700">Be the first to sync your score!</p>
            </div>
          ) : (
            <>
              {entries.map((entry, index) => (
                <div 
                  key={entry.pubkey + entry.timestamp}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50 hover:border-blue-500/30 transition-all group animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`w-8 font-black italic text-xl ${index < 3 ? 'text-yellow-500' : 'text-zinc-700'}`}>
                      {index + 1}
                    </span>
                    
                    <div className="relative">
                      {entry.picture ? (
                        <img src={entry.picture} className="w-10 h-10 rounded-full border border-zinc-700 object-cover" alt="avatar" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          <User size={18} className="text-zinc-500" />
                        </div>
                      )}
                      {index === 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-zinc-900 text-[8px] font-black text-black">1</div>}
                    </div>

                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-white max-w-[150px] truncate group-hover:text-blue-400 transition-colors">
                        {entry.name || `npub1...${entry.pubkey.substring(0, 6)}`}
                      </div>
                      <div className="text-[9px] text-zinc-600 font-mono flex items-center space-x-2">
                        <span>{new Date(entry.timestamp * 1000).toLocaleDateString()}</span>
                        {entry.bestCombo > 0 && <span className="text-cyan-900">Combo:{entry.bestCombo}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-blue-400 tabular-nums leading-none">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter mt-1">
                      POINTS
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="py-4 text-center">
                  <Loader2 size={16} className="animate-spin text-zinc-700 mx-auto" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
          <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest">
            Replaceable Event Framework / Kind 30078
          </p>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
};

export default Leaderboard;
