
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameSettings, NostrUser } from './types';
import { DEFAULT_SETTINGS } from './constants';
import TitleScreen from './components/TitleScreen';
import GameCanvas from './components/GameCanvas';
import ResultScreen from './components/ResultScreen';
import SettingsScreen from './components/SettingsScreen';

const BOOTSTRAP_RELAYS = [
  'wss://nos.lol', 
  'wss://relay.damus.io', 
  'wss://relay.snort.social', 
  'wss://yabu.me', 
  'wss://relay.nostr.band',
  'wss://purplepag.es'
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [lastScore, setLastScore] = useState(0);
  const [nostrUser, setNostrUser] = useState<NostrUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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

  const goToSettings = useCallback(() => {
    setGameState(GameState.OPTIONS);
  }, []);

  const updateSettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
  }, []);

  const fetchNostrData = async (pubkey: string): Promise<{ picture?: string; name?: string }> => {
    return new Promise((resolve) => {
      const foundData: { picture?: string; name?: string } = {};
      const processedRelays = new Set<string>();
      let resolved = false;

      const finish = () => {
        if (!resolved) {
          resolved = true;
          console.log("Nostr Metadata Fetch Finished:", foundData);
          resolve(foundData);
        }
      };

      const connectAndQuery = (url: string) => {
        if (processedRelays.has(url) || resolved) return;
        processedRelays.add(url);

        try {
          const ws = new WebSocket(url);
          const timeout = setTimeout(() => ws.close(), 4000);

          ws.onopen = () => {
            const reqId = Math.random().toString(36).substring(7);
            ws.send(JSON.stringify(["REQ", reqId, { authors: [pubkey], kinds: [0, 10002] }]));
          };

          ws.onmessage = (e) => {
            try {
              const msg = JSON.parse(e.data);
              if (msg[0] === "EVENT") {
                const event = msg[2];
                if (event.kind === 0) {
                  const content = JSON.parse(event.content);
                  if (content.picture) {
                    foundData.picture = content.picture;
                    // If picture is found, we're likely satisfied
                    setTimeout(finish, 100);
                  }
                  if (content.name) foundData.name = content.name;
                } else if (event.kind === 10002) {
                  event.tags.forEach((tag: string[]) => {
                    if (tag[0] === 'r' && tag[1]) {
                      const relayUrl = tag[1].replace(/\/$/, "");
                      if (!processedRelays.has(relayUrl)) connectAndQuery(relayUrl);
                    }
                  });
                }
              }
              if (msg[0] === "EOSE") ws.close();
            } catch (err) {}
          };

          ws.onclose = () => clearTimeout(timeout);
          ws.onerror = () => ws.close();
        } catch (err) {}
      };

      BOOTSTRAP_RELAYS.forEach(url => connectAndQuery(url));
      
      // Fallback timer
      setTimeout(finish, 5000);
    });
  };

  const loginNostr = async () => {
    setLoginError(null);
    const nostr = (window as any).nostr;
    
    if (!nostr) {
      setLoginError("Extension not found (NIP-07)");
      return;
    }

    setIsLoggingIn(true);
    try {
      const pubkey = await nostr.getPublicKey();
      setNostrUser({ pubkey });
      
      const meta = await fetchNostrData(pubkey);
      setNostrUser(prev => ({ 
        pubkey: prev?.pubkey || pubkey, 
        picture: meta.picture || prev?.picture,
        name: meta.name || prev?.name
      }));
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {gameState === GameState.TITLE && (
        <TitleScreen 
          onStart={startGame} 
          onSettings={goToSettings} 
          onLogin={loginNostr}
          isLoggingIn={isLoggingIn}
          loginError={loginError}
          nostrUser={nostrUser}
        />
      )}
      
      {gameState === GameState.OPTIONS && (
        <SettingsScreen 
          settings={settings} 
          onUpdate={updateSettings} 
          onBack={goToTitle} 
        />
      )}
      
      {gameState === GameState.PLAYING && (
        <GameCanvas settings={settings} onGameOver={endGame} userAvatar={nostrUser?.picture} />
      )}

      {gameState === GameState.GAMEOVER && (
        <ResultScreen score={lastScore} onRestart={startGame} onTitle={goToTitle} />
      )}
    </div>
  );
};

export default App;
