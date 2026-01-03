
import React from 'react';
import { RefreshCw, Home, Trophy, CloudSync, CheckCircle2, Loader2 } from 'lucide-react';
import { GameSettings } from '../types';
import { formatScore } from '../constants';

interface ResultScreenProps {
  score: number;
  settings: GameSettings;
  onRestart: () => void;
  onTitle: () => void;
  onSync: (score: number) => void;
  isSyncing: boolean;
  isLoggedIn: boolean;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ 
  score, 
  settings,
  onRestart, 
  onTitle, 
  onSync, 
  isSyncing,
  isLoggedIn 
}) => {
  const [synced, setSynced] = React.useState(false);

  const getRank = (s: number) => {
    if (s > 100000) return { label: 'LEGEND', color: 'text-yellow-500' };
    if (s > 50000) return { label: 'EXPERT', color: 'text-purple-500' };
    if (s > 10000) return { label: 'ADVANCED', color: 'text-blue-500' };
    return { label: 'NOVICE', color: 'text-zinc-400' };
  };

  const handleSync = () => {
    onSync(score);
    setSynced(true);
  };

  const rank = getRank(score);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-white p-12 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 w-full max-w-md animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col items-center">
        <Trophy size={64} className="text-yellow-500 mb-4 animate-bounce" />
        <h2 className="text-3xl font-black tracking-tighter uppercase text-zinc-500">Mission End</h2>
      </div>

      <div className="text-center">
        <div className="text-4xl md:text-5xl font-black tabular-nums tracking-tighter mb-2 break-all px-4">
          {formatScore(score, settings.scoreDisplayMode)}
        </div>
        <div className={`text-xl font-bold tracking-[0.3em] ${rank.color}`}>
          RANK: {rank.label}
        </div>
      </div>

      <div className="w-full bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Total Score</span>
            <span className="text-white font-bold">{formatScore(score, settings.scoreDisplayMode)}</span>
        </div>
        {isLoggedIn && (
          <div className="pt-2 border-t border-zinc-800/50">
            <button
              onClick={handleSync}
              disabled={isSyncing || synced}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                synced 
                ? 'bg-green-900/20 text-green-500 border border-green-500/30' 
                : 'bg-blue-600/10 text-blue-400 border border-blue-500/30 hover:bg-blue-600/20'
              }`}
            >
              {isSyncing ? <Loader2 size={14} className="animate-spin" /> : synced ? <CheckCircle2 size={14} /> : <CloudSync size={14} />}
              <span>{isSyncing ? "SYNCING..." : synced ? "RECORD SYNCHRONIZED" : "SYNC TO NOSTR"}</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-3 w-full">
        <button
          onClick={onRestart}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <RefreshCw size={20} />
          <span>RETRY MISSION</span>
        </button>
        <button
          onClick={onTitle}
          className="flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 px-8 rounded-full transition-all"
        >
          <Home size={20} />
          <span>RETURN TO HQ</span>
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
