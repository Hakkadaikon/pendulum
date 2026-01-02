
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import TitleScreen from './components/TitleScreen';
import GameCanvas from './components/GameCanvas';
import ResultScreen from './components/ResultScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [lastScore, setLastScore] = useState(0);

  const startGame = useCallback(() => {
    setGameState(GameState.PLAYING);
  }, []);

  const endGame = useCallback((score: number) => {
    setLastScore(score);
    setGameState(GameState.GAMEOVER);
  }, []);

  const goToTitle = useCallback(() => {
    setGameState(GameState.TITLE);
  }, []);

  useEffect(() => {
    // Disable right-click globally for the game feel
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {gameState === GameState.TITLE && (
        <TitleScreen onStart={startGame} onSettings={() => setGameState(GameState.OPTIONS)} />
      )}
      
      {gameState === GameState.PLAYING && (
        <GameCanvas settings={settings} onGameOver={endGame} />
      )}

      {gameState === GameState.GAMEOVER && (
        <ResultScreen score={lastScore} onRestart={startGame} onTitle={goToTitle} />
      )}
    </div>
  );
};

export default App;
