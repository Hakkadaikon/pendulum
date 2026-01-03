
export enum GameState {
  TITLE = 'TITLE',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  OPTIONS = 'OPTIONS'
}

export enum TargetType {
  YELLOW = 'YELLOW', // Normal
  GREEN = 'GREEN',   // Recovery
  RED = 'RED'       // Mass up
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Target {
  id: string;
  type: TargetType;
  pos: Vector2D;
  radius: number;
}

export interface GameSettings {
  gravity: number;
  rubberK: number;
  naturalLen: number;
  collisionDamp: number;
  isExperimental: boolean;
}

export interface GameStats {
  score: number;
  combo: number;
  comboTimer: number; // Remaining time for combo in seconds
  perfectStreak: number;
  timeLeft: number;
  rubberMaxLoad: number; // Current maximum allowed stretch
  ballMass: number;
  ballRadius: number;
  stretch: number;
  dangerTime: number; // Seconds spent in danger zone
}
