
import React, { useMemo } from 'react';

export type EvalGrade = 'FAIL' | 'OK' | 'GOOD' | 'GREAT' | 'PERFECT' | 'NONE';

interface FireworkEffectProps {
  x: number;
  y: number;
  grade: EvalGrade;
}

const FireworkEffect: React.FC<FireworkEffectProps> = ({ x, y, grade }) => {
  const settings = useMemo(() => {
    switch (grade) {
      case 'FAIL':
        return { text: '不可', color: '#94a3b8', count: 0, size: 1, spread: 0, fontSize: '24px' };
      case 'OK':
        return { text: '可', color: '#22c55e', count: 8, size: 0.5, spread: 40, fontSize: '24px' };
      case 'GOOD':
        return { text: '優良', color: '#eab308', count: 12, size: 0.8, spread: 70, fontSize: '32px' };
      case 'GREAT':
        return { text: '秀逸', color: '#f97316', count: 20, size: 1.2, spread: 100, fontSize: '40px' };
      case 'PERFECT':
        return { text: '完璧', color: '#ef4444', count: 32, size: 2.0, spread: 160, fontSize: '56px' };
      default:
        return null;
    }
  }, [grade]);

  if (!settings) return null;

  const particles = Array.from({ length: settings.count }).map((_, i) => {
    const angle = (i / settings.count) * Math.PI * 2;
    const distance = settings.spread * (0.5 + Math.random() * 0.5);
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    return (
      <div
        key={i}
        className="firework-particle"
        style={{
          left: x,
          top: y,
          backgroundColor: settings.color,
          width: `${4 * settings.size}px`,
          height: `${4 * settings.size}px`,
          '--tw-translate-x': `${tx}px`,
          '--tw-translate-y': `${ty}px`,
          boxShadow: `0 0 ${10 * settings.size}px ${settings.color}`,
        } as React.CSSProperties}
      />
    );
  });

  return (
    <>
      {particles}
      <div
        className="eval-text"
        style={{
          left: x,
          top: y,
          color: settings.color,
          fontSize: settings.fontSize,
        }}
      >
        {settings.text}
      </div>
    </>
  );
};

export default FireworkEffect;
