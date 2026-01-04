
import React from 'react';
import { ChevronLeft, RotateCcw, Hash, Binary, Bug, CheckSquare, Square } from 'lucide-react';
import { GameSettings, ScoreDisplayMode } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdate: (settings: GameSettings) => void;
  onBack: () => void;
}

const ALLOWED_MULTIPLIERS = [0.25, 0.5, 1, 2, 4];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onUpdate, onBack }) => {
  const handleReset = () => {
    onUpdate({ ...DEFAULT_SETTINGS });
  };

  const updateValue = (key: keyof GameSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const SliderGroup = ({ 
    label, 
    value, 
    defaultValue, 
    onChange
  }: { 
    label: string, 
    value: number, 
    defaultValue: number, 
    onChange: (val: number) => void
  }) => {
    const currentMult = value / defaultValue;
    
    // Find the closest index in ALLOWED_MULTIPLIERS
    const currentIndex = ALLOWED_MULTIPLIERS.reduce((prev, curr, idx) => {
      return Math.abs(curr - currentMult) < Math.abs(ALLOWED_MULTIPLIERS[prev] - currentMult) ? idx : prev;
    }, 0);
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label className="text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">{label}</label>
          <span className="text-blue-400 font-mono text-xs">x{ALLOWED_MULTIPLIERS[currentIndex].toFixed(2)}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max={ALLOWED_MULTIPLIERS.length - 1} 
          step="1" 
          value={currentIndex} 
          onChange={(e) => {
            const index = parseInt(e.target.value);
            onChange(ALLOWED_MULTIPLIERS[index] * defaultValue);
          }}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between px-1 text-[8px] text-zinc-600 font-bold">
          <span>1/4</span>
          <span>1/2</span>
          <span>1</span>
          <span>2</span>
          <span>4</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full max-h-[90dvh] md:max-h-[650px] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl text-white animate-in fade-in zoom-in duration-300 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg md:text-xl font-black italic tracking-tighter text-blue-500">SYSTEM CALIBRATION</h2>
        <button 
          onClick={handleReset}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          title="Reset to Default"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <div className="space-y-6">
          {/* Score Notation Setting */}
          <div className="space-y-3">
            <label className="text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-widest block">Large Score Notation (8+ digits)</label>
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => updateValue('scoreDisplayMode', 'kanji')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  settings.scoreDisplayMode === 'kanji' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Hash size={14} />
                <span>漢字 (Kanji)</span>
              </button>
              <button
                onClick={() => updateValue('scoreDisplayMode', 'scientific')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  settings.scoreDisplayMode === 'scientific' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Binary size={14} />
                <span>指数 (Scientific)</span>
              </button>
            </div>
          </div>

          {/* Debug Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer group" onClick={() => updateValue('isDebugMode', !settings.isDebugMode)}>
            <div className="flex items-center space-x-3">
              <Bug className={`w-5 h-5 transition-colors ${settings.isDebugMode ? 'text-red-500' : 'text-zinc-500'}`} />
              <div>
                <div className="text-xs md:text-sm font-bold text-white group-hover:text-blue-400 transition-colors">DEBUG MODE</div>
                <div className="text-[9px] md:text-[10px] text-zinc-500 font-medium">Show raw Nostr events</div>
              </div>
            </div>
            {settings.isDebugMode ? (
              <CheckSquare className="text-blue-500" size={20} />
            ) : (
              <Square className="text-zinc-700" size={20} />
            )}
          </div>

          <SliderGroup 
            label="Gravity (Weight)" 
            value={settings.gravity} 
            defaultValue={DEFAULT_SETTINGS.gravity}
            onChange={(v) => updateValue('gravity', v)}
          />
          
          <SliderGroup 
            label="Rubber Elasticity (K)" 
            value={settings.rubberK} 
            defaultValue={DEFAULT_SETTINGS.rubberK}
            onChange={(v) => updateValue('rubberK', v)}
          />

          <SliderGroup 
            label="Rubber Natural Length" 
            value={settings.naturalLen} 
            defaultValue={DEFAULT_SETTINGS.naturalLen}
            onChange={(v) => updateValue('naturalLen', v)}
          />

          <SliderGroup 
            label="Collision Bounciness" 
            value={settings.collisionDamp} 
            defaultValue={DEFAULT_SETTINGS.collisionDamp}
            onChange={(v) => updateValue('collisionDamp', v)}
          />
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <p className="text-zinc-500 text-[10px] leading-tight text-center uppercase tracking-wider">
            Notation impacts Global Rankings, Mission Results, and live HUD display.
          </p>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="p-6 border-t border-zinc-800 shrink-0">
        <button
          onClick={onBack}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
        >
          APPLY & RETURN
        </button>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SettingsScreen;
