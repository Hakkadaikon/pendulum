
import React from 'react';
import { MousePointer2, Play, Settings, User, AlertCircle, Globe } from 'lucide-react';
import { NostrUser } from '../types';

interface TitleScreenProps {
  onStart: () => void;
  onSettings: () => void;
  onLogin: () => void;
  onOpenLeaderboard: () => void;
  isLoggingIn: boolean;
  loginError: string | null;
  nostrUser: NostrUser | null;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ 
  onStart, 
  onSettings, 
  onLogin, 
  onOpenLeaderboard,
  isLoggingIn, 
  loginError,
  nostrUser 
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12 text-white text-center p-6 md:p-8 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 w-full max-w-[90vw] md:max-w-md mx-auto">
      <div className="relative">
        <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-blue-500 mb-2">
          PENDULUM
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold tracking-widest text-zinc-400">
          RUBBER ACTION
        </h2>
        {nostrUser && (
          <div className="absolute -top-4 -right-4 flex items-center space-x-2 bg-zinc-950/80 px-3 py-1.5 rounded-full border border-blue-500/50 backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-500">
            {nostrUser.picture ? (
              <img src={nostrUser.picture} className="w-6 h-6 rounded-full object-cover" alt="avatar" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center">
                <User size={12} className="text-blue-400" />
              </div>
            )}
            <span className="text-[10px] font-bold text-blue-400 tracking-tighter">
              {nostrUser.name || 'AUTHENTICATED'}
            </span>
          </div>
        )}
      </div>

      <div className="bg-zinc-950 p-4 md:p-6 rounded-xl border border-zinc-800 w-full">
        <div className="flex items-center justify-center mb-4 text-blue-400">
          <MousePointer2 className="w-8 h-8 animate-bounce" />
        </div>
        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
          Full Mouse / Touch Operation. <br />
          Swing the ball. Break targets. <br />
          Don't snap the rubber!
        </p>
      </div>

      <div className="flex flex-col space-y-3 md:space-y-4 w-full max-w-xs">
        <button
          onClick={onStart}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 md:py-4 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Play fill="currentColor" size={20} />
          <span>START MISSION</span>
        </button>
        
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 md:py-3 px-8 rounded-full transition-all border border-zinc-700"
        >
          <Globe size={18} className="text-cyan-400" />
          <span>GLOBAL RANKING</span>
        </button>

        {!nostrUser && (
          <div className="flex flex-col space-y-2">
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className={`flex items-center justify-center space-x-2 font-bold py-2 md:py-3 px-8 rounded-full transition-all border ${
                loginError 
                ? 'bg-red-900/20 border-red-500/50 text-red-400 hover:bg-red-900/30' 
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white'
              } disabled:opacity-50 text-sm`}
            >
              {isLoggingIn ? (
                <User size={18} className="animate-spin" />
              ) : loginError ? (
                <AlertCircle size={18} />
              ) : (
                <User size={18} />
              )}
              <span>{isLoggingIn ? "CONNECTING..." : loginError ? "RETRY LOGIN" : "NOSTR LOGIN"}</span>
            </button>
            {loginError && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight animate-in fade-in slide-in-from-top-2">
                {loginError}
              </p>
            )}
          </div>
        )}

        <button
          onClick={onSettings}
          className="flex items-center justify-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 font-bold py-2 md:py-3 px-8 rounded-full transition-all text-sm"
        >
          <Settings size={18} />
          <span>SETTINGS</span>
        </button>
      </div>

      <div className="w-full flex flex-col items-center space-y-4 pt-4 md:pt-6 border-t border-zinc-800/50">
        <p className="text-cyan-400 font-black text-sm md:text-base uppercase tracking-tighter italic drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
          This game is an homage to CANO-Lab / naruto - "Pendulumania"
        </p>
        <div className="space-y-1">
          <p className="text-cyan-600/80 text-[10px] md:text-xs font-bold uppercase tracking-widest">
            Touch or Drag to control
          </p>
          <p className="text-zinc-500 text-[10px] tracking-tight font-medium opacity-60">
            Sync scores with NIP-33 / Kind 30078
          </p>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
