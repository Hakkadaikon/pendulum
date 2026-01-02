
import { GameSettings, TargetType } from './types';

export const TICK_RATE = 40; // 40 FPS logic
export const TICK_TIME = 1000 / TICK_RATE;

export const DEFAULT_SETTINGS: GameSettings = {
  gravity: 0.2,
  rubberK: 0.008,
  naturalLen: 0.25,
  collisionDamp: 0.7,
  isExperimental: false
};

export const INITIAL_TIME = 60;
export const DANGER_THRESHOLD = 1.0; // 100%
export const BREAK_TIME_LIMIT = 0.25; // seconds

export const TARGET_COLORS = {
  [TargetType.YELLOW]: '#fbbf24',
  [TargetType.GREEN]: '#34d399',
  [TargetType.RED]: '#f87171'
};

export const BALL_INITIAL_RADIUS = 10;
export const BALL_INITIAL_MASS = 1.0;
export const RUBBER_INITIAL_MAX_LEN = 200;
