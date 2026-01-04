
import { GameSettings, TargetType, ScoreDisplayMode } from './types';

export const TICK_RATE = 120; // Increased from 40 to 120 for smoother movement
export const TICK_TIME = 1000 / TICK_RATE;

export const DEFAULT_SETTINGS: GameSettings = {
  // Constants scaled for 120fps (roughly 1/9th of 40fps values for quadratic integration)
  gravity: 0.022, 
  rubberK: 0.0009,
  naturalLen: 0.25,
  collisionDamp: 0.7,
  isExperimental: false,
  scoreDisplayMode: 'kanji'
};

export const INITIAL_TIME = 60;
export const DANGER_THRESHOLD = 1.0; // 100%
export const BREAK_TIME_LIMIT = 0.25; // seconds
export const COMBO_TIME_LIMIT = 5.0; // seconds
export const SPECIAL_EFFECT_DURATION = 10.0; // seconds
export const CHEST_EFFECT_DURATION = 5.0; // seconds

export const TARGET_COLORS = {
  [TargetType.YELLOW]: '#fbbf24',
  [TargetType.GREEN]: '#34d399',
  [TargetType.RED]: '#f87171',
  [TargetType.WHITE]: '#ffffff',
  [TargetType.BLACK]: '#111111',
  [TargetType.CHEST]: '#fcd34d' // Gold
};

export const BALL_INITIAL_RADIUS = 10;
export const BALL_INITIAL_MASS = 1.0;
export const RUBBER_INITIAL_MAX_LEN = 200;

/**
 * Formats a score based on the chosen display mode.
 */
export const formatScore = (num: number, mode: ScoreDisplayMode) => {
  if (num === 0) return "0";
  if (num < 10000) return Math.floor(num).toLocaleString();
  
  if (mode === 'scientific') {
    if (num >= 10000000) {
      return num.toExponential(3);
    }
    return Math.floor(num).toLocaleString();
  }

  const units = ["", "万", "億", "兆", "京", "垓", "𥝱", "穣", "溝", "澗", "正", "載", "極", "恒河沙", "阿僧祇", "那由他", "不可思議", "無量大数"];
  
  const getPlainString = (n: number) => {
    const s = n.toString();
    if (!s.includes('e')) return s.split('.')[0];
    const [mantissa, exponent] = s.split('e');
    const exp = parseInt(exponent);
    const [int, dec = ''] = mantissa.split('.');
    if (exp >= 0) {
      return (int + dec.padEnd(exp, '0')).slice(0, int.length + exp);
    }
    return "0";
  };

  const fullStr = getPlainString(num);
  const allParts = [];
  let unitCounter = 0;
  for (let i = fullStr.length; i > 0; i -= 4) {
    const start = Math.max(0, i - 4);
    const val = parseInt(fullStr.substring(start, i));
    if (val > 0 && unitCounter < units.length) {
      allParts.unshift(val + units[unitCounter]);
    }
    unitCounter++;
  }

  return allParts.slice(0, 2).join("");
};
