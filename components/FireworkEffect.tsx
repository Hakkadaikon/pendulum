
import React, { useMemo } from 'react';

export type EvalGrade = 'FAIL' | 'OK' | 'GOOD' | 'GREAT' | 'PERFECT' | 'NONE';

interface FireworkEffectProps {
  x: number;
  y: number;
  grade: EvalGrade;
  stretchPercent: number;
}

const FireworkEffect: React.FC<FireworkEffectProps> = ({ x, y, grade, stretchPercent }) => {
  const settings = useMemo(() => {
    switch (grade) {
      case 'FAIL':
        return { text: '不可', color: '#94a3b8', fontSize: '24px' };
      case 'OK':
        return { text: '可', color: '#22c55e', fontSize: '32px' };
      case 'GOOD':
        return { text: '優良', color: '#eab308', fontSize: '48px' };
      case 'GREAT':
        return { text: '秀逸', color: '#f97316', fontSize: '64px' };
      case 'PERFECT':
        return { text: '完璧', color: '#ef4444', fontSize: '80px' };
      default:
        return null;
    }
  }, [grade]);

  if (!settings) return null;

  return (
    <div
      className="eval-text flex flex-col items-center"
      style={{
        left: x,
        top: y,
        color: settings.color,
      }}
    >
      <div style={{ fontSize: settings.fontSize }}>{settings.text}</div>
      <div className="font-mono text-sm opacity-90 mt-[-10px] bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
        {stretchPercent}%
      </div>
    </div>
  );
};

export default FireworkEffect;
