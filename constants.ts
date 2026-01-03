
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

export const TARGET_COLORS = {
  [TargetType.YELLOW]: '#fbbf24',
  [TargetType.GREEN]: '#34d399',
  [TargetType.RED]: '#f87171'
};

export const BALL_INITIAL_RADIUS = 10;
export const BALL_INITIAL_MASS = 1.0;
export const RUBBER_INITIAL_MAX_LEN = 200;

/**
 * Formats a score based on the chosen display mode.
 * For Kanji mode, it calculates the correct unit every 10^4.
 */
export const formatScore = (num: number, mode: ScoreDisplayMode) => {
  if (num === 0) return "0";
  if (num < 10000) return Math.floor(num).toLocaleString();
  
  if (mode === 'scientific') {
    // For values like 10^8 or higher, show scientific if selected
    if (num >= 10000000) {
      return num.toExponential(3);
    }
    return Math.floor(num).toLocaleString();
  }

  // Kanji Notation Logic
  // Units increase every 4 powers of 10.
  const units = ["", "万", "億", "兆", "京", "垓", "𥝱", "穣", "溝", "澗", "正", "載", "極", "恒河沙", "阿僧祇", "那由他", "不可思議", "無量大数"];
  
  const log10 = Math.log10(num);
  const unitIdx = Math.floor(log10 / 4);

  if (unitIdx === 0) return Math.floor(num).toLocaleString();
  
  // To handle the breakdown (e.g., 123正4567載), we use a string-based approach
  // that is safe from scientific notation strings returned by toFixed for huge numbers.
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
  let result = "";
  let partsCount = 0;
  
  // Grouping from the end of the string
  for (let i = fullStr.length; i > 0; i -= 4) {
    const start = Math.max(0, i - 4);
    const chunk = fullStr.substring(start, i);
    const val = parseInt(chunk);
    const currentUnitIdx = Math.floor((fullStr.length - i) / 4);
    
    if (val > 0 && currentUnitIdx < units.length) {
      result = val + units[currentUnitIdx] + result;
      partsCount++;
    }
    
    // Limit to top 2 non-zero units for UI readability (e.g., "123正4567載")
    // If the score is extremely high, showing 18 units would be unreadable.
    if (partsCount >= 2) {
      // We only want the highest units, so if we've found 2 from the right, 
      // they might not be the highest. Actually, let's collect all and slice.
    }
  }

  // Re-calculate to only get the top 2 highest units for display
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
