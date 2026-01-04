
import React from 'react';
import { Timer, Trophy, Activity, Zap, MoveUp, ShieldCheck } from 'lucide-react';

interface UIOverlayProps {
  refs: {
    score: React.RefObject<HTMLDivElement | null>;
    timer: React.RefObject<HTMLDivElement | null>;
    combo: React.RefObject<HTMLDivElement | null>;
    comboTimerContainer: React.RefObject<HTMLDivElement | null>;
    comboTimerBar: React.RefObject<HTMLDivElement | null>;
    whiteTimerBar: React.RefObject<HTMLDivElement | null>;
    blackTimerBar: React.RefObject<HTMLDivElement | null>;
    chestTimerBar: React.RefObject<HTMLDivElement | null>;
    whiteTimerContainer: React.RefObject<HTMLDivElement | null>;
    blackTimerContainer: React.RefObject<HTMLDivElement | null>;
    chestTimerContainer: React.RefObject<HTMLDivElement | null>;
    perfect: React.RefObject<HTMLDivElement | null>;
    gauge: React.RefObject<HTMLDivElement | null>;
    gaugeContainer: React.RefObject<HTMLDivElement | null>;
    tensionLabel: React.RefObject<HTMLSpanElement | null>;
    tensionValue: React.RefObject<HTMLDivElement | null>;
    dangerBorder: React.RefObject<HTMLDivElement | null>;
  };
}

const UIOverlay: React.FC<UIOverlayProps> = ({ refs }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 pb-12 md:pb-16 select-none font-mono">
      {/* Top Bar */}
      <div className="flex justify-between items-start gap-2">
        <div className="bg-zinc-900/80 p-3 md:p-4 rounded-xl border border-zinc-700 flex items-center space-x-2 md:space-x-4 shadow-lg backdrop-blur-sm">
          <Trophy className="text-yellow-500 w-6 h-6 md:w-8 md:h-8" />
          <div>
            <div className="text-zinc-500 text-[8px] md:text-[10px] uppercase font-bold tracking-widest">Score</div>
            <div ref={refs.score} className="text-xl md:text-3xl font-black text-white tabular-nums leading-none">
              0
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/80 p-3 md:p-4 rounded-xl border border-zinc-700 flex items-center space-x-2 md:space-x-4 shadow-lg backdrop-blur-sm">
          <Timer className="text-blue-400 w-6 h-6 md:w-8 md:h-8" />
          <div>
            <div className="text-zinc-500 text-[8px] md:text-[10px] uppercase font-bold tracking-widest">Time</div>
            <div ref={refs.timer} className="text-xl md:text-3xl font-black text-white tabular-nums leading-none">
              60.0
            </div>
          </div>
        </div>
      </div>

      {/* Center UI */}
      <div className="flex flex-col items-center space-y-4">
        <div ref={refs.combo} className="text-center animate-bounce text-blue-400 text-3xl md:text-5xl font-black italic drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ display: 'none' }}>
          0 Hits
        </div>
        
        {/* Progress Bars Container */}
        <div className="flex flex-col items-center space-y-2">
            {/* Combo Timer Bar Container */}
            <div ref={refs.comboTimerContainer} className="w-32 md:w-48 h-1 md:h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700/50 shadow-sm" style={{ display: 'none' }}>
            <div 
                ref={refs.comboTimerBar}
                className="h-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] transition-all duration-75"
                style={{ width: '100%' }}
            />
            </div>

            {/* White Ball Timer (Kinetic) */}
            <div ref={refs.whiteTimerContainer} className="w-32 md:w-48 h-1 md:h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/20 shadow-sm relative" style={{ display: 'none' }}>
                <div 
                    ref={refs.whiteTimerBar}
                    className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-75"
                    style={{ width: '100%' }}
                />
                <Zap className="absolute right-1 top-1/2 -translate-y-1/2 text-white w-2 h-2" />
            </div>

            {/* Black Ball Timer (Gravity) */}
            <div ref={refs.blackTimerContainer} className="w-32 md:w-48 h-1 md:h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/40 shadow-sm relative" style={{ display: 'none' }}>
                <div 
                    ref={refs.blackTimerBar}
                    className="h-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.8)] transition-all duration-75"
                    style={{ width: '100%' }}
                />
                <MoveUp className="absolute right-1 top-1/2 -translate-y-1/2 text-white w-2 h-2" />
            </div>

            {/* Chest Timer (Unlimited) */}
            <div ref={refs.chestTimerContainer} className="w-32 md:w-48 h-1 md:h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-yellow-500/50 shadow-sm relative" style={{ display: 'none' }}>
                <div 
                    ref={refs.chestTimerBar}
                    className="h-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,1)] transition-all duration-75"
                    style={{ width: '100%' }}
                />
                <ShieldCheck className="absolute right-1 top-1/2 -translate-y-1/2 text-black w-2 h-2" />
                <span className="absolute inset-0 flex items-center justify-center text-[6px] font-black text-black uppercase tracking-tighter">Unlimited</span>
            </div>
        </div>

        <div ref={refs.perfect} className="text-yellow-400 text-sm md:text-xl font-bold tracking-widest uppercase" style={{ display: 'none' }}>
          Perfect x0
        </div>
      </div>

      {/* Bottom Bar - Stretch Gauge */}
      <div className="space-y-2 md:space-y-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
                <Activity size={14} className="text-zinc-500" />
                <span ref={refs.tensionLabel} className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500">
                    TENSION
                </span>
            </div>
            <div ref={refs.tensionValue} className="text-[10px] md:text-xs text-zinc-500 font-bold tabular-nums">
                0%
            </div>
        </div>
        
        <div ref={refs.gaugeContainer} className="h-3 md:h-4 bg-zinc-900 rounded-full border border-zinc-700 overflow-hidden relative shadow-inner">
          <div 
            ref={refs.gauge}
            className="h-full bg-blue-500"
            style={{ width: `0%` }}
          />
          <div className="absolute left-[90%] top-0 bottom-0 w-px bg-white/40" />
        </div>
      </div>

      {/* Screen Danger Effect */}
      <div ref={refs.dangerBorder} className="absolute inset-0 border-4 md:border-8 border-red-500/30 animate-pulse rounded-lg pointer-events-none transition-opacity duration-300 opacity-0" />
    </div>
  );
};

export default UIOverlay;
