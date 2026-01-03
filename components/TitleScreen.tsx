
import React from 'react';
import { MousePointer2, Play, Settings } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onSettings: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onSettings }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 text-white text-center p-8 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800">
      <div>
        <h1 className="text-6xl font-black italic tracking-tighter text-blue-500 mb-2">
          PENDULUM
        </h1>
        <h2 className="text-4xl font-bold tracking-widest text-zinc-400">
          RUBBER ACTION
        </h2>
      </div>

      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 max-w-sm">
        <div className="flex items-center justify-center mb-4 text-blue-400">
          <MousePointer2 className="w-8 h-8 animate-bounce" />
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Full Mouse Operation. <br />
          Swing the ball. Break targets. <br />
          Don't snap the rubber!
        </p>
      </div>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <button
          onClick={onStart}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95"
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

      <p className="text-zinc-600 text-xs mt-4">
        Move mouse to control. Avoid stretching > 100%.
      </p>
    </div>
  );
};

export default TitleScreen;
