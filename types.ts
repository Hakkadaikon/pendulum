
export enum GameState {
  TITLE = 'TITLE',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  OPTIONS = 'OPTIONS'
}

export enum TargetType {
  YELLOW = 'YELLOW', // Normal
  GREEN = 'GREEN',   // Recovery
  RED = 'RED',       // Mass up
  WHITE = 'WHITE',   // Kinetic Chaos
  BLACK = 'BLACK',   // Gravity Invert
  CHEST = 'CHEST'    // Unlimited Rubber
}

export type ScoreDisplayMode = 'scientific' | 'kanji';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Target {
  id: string;
  type: TargetType;
  pos: Vector2D;
  radius: number;
  vel?: Vector2D; // Added for moving targets
}

export interface GameSettings {
  gravity: number;
  rubberK: number;
  naturalLen: number;
  collisionDamp: number;
  isExperimental: boolean;
  scoreDisplayMode: ScoreDisplayMode;
  isDebugMode: boolean; // Added
}

export interface GameStats {
  score: number;
  combo: number;
  comboTimer: number; 
  perfectStreak: number;
  timeLeft: number;
  rubberMaxLoad: number;
  ballMass: number;
  ballRadius: number;
  stretch: number;
  dangerTime: number;
  whiteEffectTimer: number; 
  blackEffectTimer: number;
  chestEffectTimer: number; // Added
}

export interface NostrUser {
  pubkey: string;
  picture?: string;
  name?: string;
}

export interface HighScoreContent {
  score: number;
  bestCombo: number;
  settings: GameSettings;
  timestamp: number;
}

export interface LeaderboardEntry {
  pubkey: string;
  name?: string;
  picture?: string;
  score: number;
  bestCombo: number;
  timestamp: number;
  rawKind0?: any;     // Added for Debug Mode
  rawKind30078?: any; // Added for Debug Mode
}
