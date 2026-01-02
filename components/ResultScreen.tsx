
import React from 'react';
import { RefreshCw, Home, Trophy, Star } from 'lucide-react';

interface ResultScreenProps {
  score: number;
  onRestart: () => void;
  onTitle: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, onRestart, onTitle }) => {
  const getRank = (s: number) => {
    if (s > 100000) return { label: 'LEGEND', color: 'text-yellow-500' };
    if (s > 50000) return { label: 'EXPERT', color: 'text-purple-500' };
    if (s > 10000) return { label: 'ADVANCED', color: 'text-blue-500' };
    return { label: 'NOVICE', color: 'text-zinc-400' };
  };

  const rank = getRank(score);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-white p-12 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 w-full max-w-md">
      <div className="flex flex-col items-center">
        <Trophy size={64} className="text-yellow-500 mb-4 animate-bounce" />
        <h2 className="text-3xl font-black tracking-tighter uppercase text-zinc-500">Mission End</h2>
      </div>

      <div className="text-center">
        <div className="text-6xl font-black tabular-nums tracking-tighter mb-2">
          {score.toLocaleString()}
        </div>
        <div className={`text-xl font-bold tracking-[0.3em] ${rank.color}`}>
          RANK: {rank.label}
        </div>
      </div>

      <div className="w-full bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Total Score</span>
            <span className="text-white font-bold">{score}</span>
        </div>
        <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Best Combo</span>
            <span className="text-white font-bold">N/A</span>
        </div>
      </div>

      <div className="flex flex-col space-y-3 w-full">
        <button
          onClick={onRestart}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95"
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
