
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
        return { text: '不可', color: '#94a3b8', count: 10, size: 0.5, spread: 50, fontSize: '24px' };
      case 'OK':
        return { text: '可', color: '#22c55e', count: 40, size: 0.8, spread: 150, fontSize: '32px' };
      case 'GOOD':
        return { text: '優良', color: '#eab308', count: 80, size: 1.2, spread: 300, fontSize: '48px' };
      case 'GREAT':
        return { text: '秀逸', color: '#f97316', count: 150, size: 1.8, spread: 450, fontSize: '64px' };
      case 'PERFECT':
        return { text: '完璧', color: '#ef4444', count: 280, size: 2.5, spread: 700, fontSize: '80px' };
      default:
        return null;
    }
  }, [grade]);

  if (!settings) return null;

  const particles = Array.from({ length: settings.count }).map((_, i) => {
    // Distribute more particles toward the edge for a "ring" effect at high counts
    const angle = (i / settings.count) * Math.PI * 2 + (Math.random() * 0.5);
    const distFactor = Math.random() * 0.7 + 0.3; // More particles away from center
    const distance = settings.spread * distFactor;
    
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    // Randomize individual particle behavior
    const duration = 0.8 + Math.random() * 0.8;
    const delay = Math.random() * 0.15;
    const pSize = (2 + Math.random() * 4) * settings.size;

    return (
      <div
        key={i}
        className="firework-particle"
        style={{
          left: x,
          top: y,
          backgroundColor: settings.color,
          width: `${pSize}px`,
          height: `${pSize}px`,
          '--tw-translate-x': `${tx}px`,
          '--tw-translate-y': `${ty}px`,
          '--p-duration': `${duration}s`,
          '--p-delay': `${delay}s`,
          boxShadow: `0 0 ${pSize * 2}px ${settings.color}, 0 0 ${pSize * 4}px ${settings.color}88`,
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
