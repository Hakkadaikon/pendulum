
import React from 'react';
import { GameStats } from '../types';
import { Timer, Trophy, Activity } from 'lucide-react';

interface UIOverlayProps {
  stats: GameStats;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ stats }) => {
  const stretchPercent = Math.min(100, (stats.stretch * 100));
  const isDanger = stats.stretch > 1.0;
  const isPerfect = stats.stretch >= 0.9 && stats.stretch <= 1.0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 select-none font-mono">
      {/* Top Bar */}
      <div className="flex justify-between items-start gap-2">
        <div className="bg-zinc-900/80 p-3 md:p-4 rounded-xl border border-zinc-700 flex items-center space-x-2 md:space-x-4 shadow-lg backdrop-blur-sm">
          <Trophy className="text-yellow-500 w-6 h-6 md:w-8 md:h-8" />
          <div>
            <div className="text-zinc-500 text-[8px] md:text-[10px] uppercase font-bold tracking-widest">Score</div>
            <div className="text-xl md:text-3xl font-black text-white tabular-nums leading-none">
              {stats.score.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 p-3 md:p-4 rounded-xl border border-zinc-700 flex items-center space-x-2 md:space-x-4 shadow-lg backdrop-blur-sm">
          <Timer className={`${stats.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-blue-400'} w-6 h-6 md:w-8 md:h-8`} />
          <div>
            <div className="text-zinc-500 text-[8px] md:text-[10px] uppercase font-bold tracking-widest">Time</div>
            <div className="text-xl md:text-3xl font-black text-white tabular-nums leading-none">
              {Math.max(0, stats.timeLeft).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Center Combo Pop-up */}
      <div className="flex flex-col items-center">
        {stats.combo > 0 && (
          <div className="animate-bounce text-center">
            <div className="text-blue-400 text-3xl md:text-5xl font-black italic drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              {stats.combo} <span className="text-lg md:text-2xl not-italic uppercase tracking-tighter">Hits</span>
            </div>
            {stats.perfectStreak > 0 && (
              <div className="text-yellow-400 text-sm md:text-xl font-bold tracking-widest uppercase">
                Perfect x{stats.perfectStreak}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar - Stretch Gauge */}
      <div className="space-y-2 md:space-y-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
                <Activity size={14} className={isDanger ? 'text-red-500 animate-pulse' : 'text-zinc-500'} />
                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${isDanger ? 'text-red-500' : 'text-zinc-500'}`}>
                    {isDanger ? 'WARNING' : isPerfect ? 'PERFECT' : 'TENSION'}
                </span>
            </div>
            <div className="text-[10px] md:text-xs text-zinc-500 font-bold tabular-nums">
                {Math.round(stretchPercent)}%
            </div>
        </div>
        
        <div className="h-3 md:h-4 bg-zinc-900 rounded-full border border-zinc-700 overflow-hidden relative shadow-inner">
          <div 
            className={`h-full transition-all duration-75 ${
              isDanger ? 'bg-red-500 animate-pulse' : isPerfect ? 'bg-yellow-400' : 'bg-blue-500'
            }`}
            style={{ width: `${stretchPercent}%` }}
          />
          <div className="absolute left-[90%] top-0 bottom-0 w-px bg-white/40" />
        </div>
      </div>

      {/* Screen Danger Effect */}
      {isDanger && (
        <div className="absolute inset-0 border-4 md:border-8 border-red-500/30 animate-pulse rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default UIOverlay;
