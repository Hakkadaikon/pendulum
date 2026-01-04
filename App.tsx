
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameSettings, NostrUser, LeaderboardEntry, HighScoreContent } from './types';
import { DEFAULT_SETTINGS } from './constants';
import TitleScreen from './components/TitleScreen';
import GameCanvas from './components/GameCanvas';
import ResultScreen from './components/ResultScreen';
import SettingsScreen from './components/SettingsScreen';
import Leaderboard from './components/Leaderboard';

const BOOTSTRAP_RELAYS = [
  'wss://nos.lol', 
  'wss://relay.damus.io', 
  'wss://relay.snort.social', 
  'wss://yabu.me', 
  'wss://relay.nostr.band',
  'wss://purplepag.es'
];

const D_TAG = 'pendulum-rubber-action/highscore';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [lastScore, setLastScore] = useState(0);
  const [nostrUser, setNostrUser] = useState<NostrUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

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
                  if (content.picture) { foundData.picture = content.picture; setTimeout(finish, 100); }
                  if (content.name) foundData.name = content.name;
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
      setTimeout(finish, 5000);
    });
  };

  const loginNostr = async () => {
    setLoginError(null);
    const nostr = (window as any).nostr;
    if (!nostr) { setLoginError("Extension not found"); return; }
    setIsLoggingIn(true);
    try {
      const pubkey = await nostr.getPublicKey();
      setNostrUser({ pubkey });
      const meta = await fetchNostrData(pubkey);
      setNostrUser({ pubkey, ...meta });
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const saveHighScore = async (score: number) => {
    const nostr = (window as any).nostr;
    if (!nostr || !nostrUser) return;
    setIsSyncing(true);

    try {
      const content: HighScoreContent = {
        score,
        bestCombo: 0,
        settings,
        timestamp: Math.floor(Date.now() / 1000)
      };

      const event = {
        kind: 30078,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["d", D_TAG],
          ["score", score.toString()]
        ],
        content: JSON.stringify(content)
      };

      const signedEvent = await nostr.signEvent(event);
      BOOTSTRAP_RELAYS.forEach(url => {
        const ws = new WebSocket(url);
        ws.onopen = () => { ws.send(JSON.stringify(["EVENT", signedEvent])); setTimeout(() => ws.close(), 1000); };
      });
      console.log("Score Synced to Nostr");
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadLeaderboard = async () => {
    setIsLeaderboardOpen(true);
    setIsLoadingLeaderboard(true);
    setLeaderboard([]);
    
    const entries: Map<string, LeaderboardEntry> = new Map();
    const relayUrls = BOOTSTRAP_RELAYS.slice(0, 4);

    await Promise.all(relayUrls.map(url => {
      return new Promise<void>((resolve) => {
        const ws = new WebSocket(url);
        const timeout = setTimeout(() => { ws.close(); resolve(); }, 6000);
        ws.onopen = () => ws.send(JSON.stringify(["REQ", "lb", { kinds: [30078], "#d": [D_TAG], limit: 50 }]));
        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg[0] === "EVENT") {
            const ev = msg[2];
            try {
              const content = JSON.parse(ev.content);
              const scoreVal = Number(content.score) || 0;
              const existing = entries.get(ev.pubkey);
              if (!existing || existing.timestamp < ev.created_at) {
                entries.set(ev.pubkey, {
                  pubkey: ev.pubkey,
                  score: scoreVal,
                  bestCombo: content.bestCombo || 0,
                  timestamp: ev.created_at,
                  rawKind30078: ev // Store raw event for Debug Mode
                });
              }
            } catch(e) {}
          }
          if (msg[0] === "EOSE") { ws.close(); resolve(); }
        };
        ws.onclose = () => { clearTimeout(timeout); resolve(); };
        ws.onerror = () => resolve();
      });
    }));

    const sorted = Array.from(entries.values()).sort((a, b) => b.score - a.score).slice(0, 20);
    if (sorted.length === 0) {
      setIsLoadingLeaderboard(false);
      return;
    }

    const pubkeysToFetch = sorted.map(s => s.pubkey);
    const metadataMap: Map<string, {name?: string, picture?: string, raw?: any}> = new Map();

    await Promise.all(relayUrls.map(url => {
      return new Promise<void>((resolve) => {
        const ws = new WebSocket(url);
        const timeout = setTimeout(() => { ws.close(); resolve(); }, 4000);
        ws.onopen = () => ws.send(JSON.stringify(["REQ", "meta", { authors: pubkeysToFetch, kinds: [0] }]));
        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg[0] === "EVENT") {
            const ev = msg[2];
            try {
              const content = JSON.parse(ev.content);
              metadataMap.set(ev.pubkey, { name: content.name, picture: content.picture, raw: ev });
            } catch(e) {}
          }
          if (msg[0] === "EOSE") { ws.close(); resolve(); }
        };
        ws.onclose = () => { clearTimeout(timeout); resolve(); };
        ws.onerror = () => resolve();
      });
    }));

    const finalEntries = sorted.map(entry => {
      const meta = metadataMap.get(entry.pubkey);
      return {
        ...entry,
        name: meta?.name,
        picture: meta?.picture,
        rawKind0: meta?.raw // Store raw kind0 event for Debug Mode
      };
    });

    setLeaderboard(finalEntries);
    setIsLoadingLeaderboard(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#010103] flex items-center justify-center">
      <div 
        className={`relative flex items-center justify-center ${gameState === GameState.PLAYING ? 'shadow-2xl' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          minWidth: '450px',
          minHeight: '650px',
          // aspect ratio 9/16 for playing, or fit normally for screens
          aspectRatio: gameState === GameState.PLAYING ? '9 / 16' : 'unset',
          maxHeight: gameState === GameState.PLAYING ? 'min(100vh, 100%)' : 'unset',
          maxWidth: gameState === GameState.PLAYING ? 'min(100vw, calc(100vh * 9 / 16))' : '450px'
        }}
      >
        {gameState === GameState.TITLE && (
          <TitleScreen 
            onStart={startGame} 
            onSettings={goToSettings} 
            onLogin={loginNostr}
            onOpenLeaderboard={loadLeaderboard}
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
          <div className="w-full h-full relative overflow-hidden bg-black shadow-2xl border-x border-white/5" style={{ minWidth: '450px', minHeight: '650px' }}>
            <GameCanvas settings={settings} onGameOver={endGame} userAvatar={nostrUser?.picture} />
          </div>
        )}

        {gameState === GameState.GAMEOVER && (
          <ResultScreen 
            score={lastScore} 
            settings={settings}
            onRestart={startGame} 
            onTitle={goToTitle} 
            onSync={saveHighScore}
            isSyncing={isSyncing}
            isLoggedIn={!!nostrUser}
          />
        )}

        {isLeaderboardOpen && (
          <Leaderboard 
            entries={leaderboard} 
            isLoading={isLoadingLeaderboard}
            displayMode={settings.scoreDisplayMode}
            isDebugMode={settings.isDebugMode}
            onClose={() => setIsLeaderboardOpen(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
