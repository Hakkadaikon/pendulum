
import React from 'react';
import { MousePointer2, Play, Settings } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onSettings: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onSettings }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 text-white text-center p-6 md:p-8 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 max-w-[95vw] md:max-w-md">
      <div>
        <h1 className="text-6xl font-black italic tracking-tighter text-blue-500 mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          PENDULUM
        </h1>
        <h2 className="text-4xl font-bold tracking-widest text-zinc-400">
          RUBBER ACTION
        </h2>
      </div>

      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 w-full">
        <div className="flex items-center justify-center mb-4 text-blue-400">
          <MousePointer2 className="w-8 h-8 animate-bounce" />
        </div>
        <p className="text-zinc-300 text-base md:text-lg font-bold leading-relaxed">
          Full Operation Control. <br />
          Swing the ball. Break targets. <br />
          <span className="text-red-400">Don't snap the rubber!</span>
        </p>
      </div>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <button
          onClick={onStart}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
        >
          <Play fill="currentColor" size={20} />
          <span>START MISSION</span>
        </button>
        <button
          onClick={onSettings}
          className="flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 px-8 rounded-full transition-all"
        >
          <Settings size={20} />
          <span>SETTINGS</span>
        </button>
      </div>

      <div className="w-full flex flex-col items-center space-y-6 pt-6 border-t border-zinc-800/50">
        <div className="space-y-2">
          <p className="text-cyan-300 text-sm md:text-base font-black tracking-wide uppercase drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]">
            Move mouse or touch to control
          </p>
          <p className="text-zinc-400 text-xs md:text-sm font-bold">
            Avoid stretching over 100% Tension
          </p>
        </div>
        
        <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/80 w-full">
          <p className="text-zinc-300 text-sm md:text-base tracking-tight font-bold italic leading-snug">
            This game is an homage to <br />
            <span className="text-blue-400 not-italic">CANO-Lab / naruto - "Pendulumania"</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
