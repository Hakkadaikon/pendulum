
import React, { useState, useRef, useEffect } from 'react';
import { X, Trophy, User, Hash, Loader2, Bug, Code } from 'lucide-react';
import { LeaderboardEntry, ScoreDisplayMode } from '../types';
import { formatScore } from '../constants';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  onClose: () => void;
  displayMode?: ScoreDisplayMode;
  isDebugMode?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, isLoading, onClose, displayMode = 'kanji', isDebugMode = false }) => {
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside the rows to clear selection
  const handleContainerClick = (e: React.MouseEvent) => {
    if (isDebugMode && selectedEntry) {
      // If the click is on the background or container but not on a row
      setSelectedEntry(null);
    }
  };

  const handleRowClick = (e: React.MouseEvent, entry: LeaderboardEntry) => {
    if (isDebugMode) {
      e.stopPropagation(); // Prevent container click from firing
      // Toggle selection or select new
      setSelectedEntry(selectedEntry?.pubkey === entry.pubkey ? null : entry);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative"
        onClick={(e) => {
          e.stopPropagation(); // Don't close modal when clicking inside it
          handleContainerClick(e);
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center space-x-3">
            <Trophy className="text-yellow-500" size={28} />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black italic tracking-tighter text-blue-500 leading-none">GLOBAL RANKING</h2>
                {isDebugMode && <Bug className="text-red-500 animate-pulse" size={16} title="Debug Mode Active" />}
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Nostr High Scores (Kind 30078)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* List Section */}
        <div 
          ref={listRef}
          className={`flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar transition-all duration-300 ${isDebugMode && selectedEntry ? 'max-h-[40%]' : 'max-h-none'}`}
        >
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
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all group animate-in fade-in slide-in-from-bottom-2 relative ${
                    selectedEntry?.pubkey === entry.pubkey 
                    ? 'bg-blue-900/40 border-blue-400 ring-2 ring-blue-500/50' 
                    : isDebugMode 
                      ? 'bg-zinc-950/50 border-zinc-800/50 hover:border-blue-500/30 cursor-pointer active:scale-[0.98]' 
                      : 'bg-zinc-950/50 border-zinc-800/50'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={(e) => handleRowClick(e, entry)}
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
                      <div className={`text-sm font-bold max-w-[150px] truncate transition-colors ${selectedEntry?.pubkey === entry.pubkey ? 'text-blue-300' : 'text-white group-hover:text-blue-400'}`}>
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
                      {formatScore(entry.score, displayMode as ScoreDisplayMode)}
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

        {/* Debug Inspector Panel */}
        {isDebugMode && selectedEntry && (
          <div className="flex-1 min-h-[50%] bg-[#0a0a0c] border-t border-red-900/50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-2 bg-red-950/20 border-b border-red-900/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-red-400 font-bold text-[10px] tracking-widest uppercase px-2">
                <Code size={14} />
                <span>Nostr Event Inspector</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[8px] text-zinc-500 font-mono bg-zinc-900 px-2 py-0.5 rounded">
                    PUBKEY: {selectedEntry.pubkey.substring(0, 16)}...
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedEntry(null); }}
                  className="p-1 hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <X size={12} className="text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 custom-scrollbar text-[10px] font-mono leading-tight bg-[#050507]">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <div className="text-zinc-500 uppercase font-black text-[8px]">Kind 0: Metadata</div>
                  </div>
                  <pre className="p-3 bg-black border border-zinc-800/50 rounded-lg text-green-500 whitespace-pre-wrap overflow-x-hidden break-all shadow-inner">
                    {selectedEntry.rawKind0 ? JSON.stringify(selectedEntry.rawKind0, null, 2) : "No Kind 0 data found"}
                  </pre>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <div className="text-zinc-500 uppercase font-black text-[8px]">Kind 30078: High Score</div>
                  </div>
                  <pre className="p-3 bg-black border border-zinc-800/50 rounded-lg text-blue-400 whitespace-pre-wrap overflow-x-hidden break-all shadow-inner">
                    {selectedEntry.rawKind30078 ? JSON.stringify(selectedEntry.rawKind30078, null, 2) : "No Kind 30078 data found"}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center shrink-0">
          <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest">
            {isDebugMode ? (selectedEntry ? "INSPECTOR ACTIVE: Click elsewhere to clear" : "DEBUGGER ACTIVE: Click a row to inspect events") : "Replaceable Event Framework / Kind 30078"}
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
