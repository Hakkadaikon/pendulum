
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  TICK_TIME, 
  TICK_RATE, 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  BALL_INITIAL_RADIUS, 
  BALL_INITIAL_MASS, 
  RUBBER_INITIAL_MAX_LEN,
  INITIAL_TIME,
  DANGER_THRESHOLD,
  BREAK_TIME_LIMIT,
  TARGET_COLORS
} from '../constants';
import { GameSettings, Vector2D, Target, TargetType, GameStats } from '../types';
import UIOverlay from './UIOverlay';
import FireworkEffect, { EvalGrade } from './FireworkEffect';

interface FireworkInstance {
  id: string;
  x: number;
  y: number;
  grade: EvalGrade;
}

interface GameCanvasProps {
  settings: GameSettings;
  onGameOver: (score: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ settings, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Physics State Refs
  const anchorPos = useRef<Vector2D>({ x: CANVAS_WIDTH / 2, y: 100 });
  const ballPos = useRef<Vector2D>({ x: CANVAS_WIDTH / 2, y: 200 });
  const ballVel = useRef<Vector2D>({ x: 0, y: 0 });
  
  const statsRef = useRef<GameStats>({
    score: 0,
    combo: 0,
    perfectStreak: 0,
    timeLeft: INITIAL_TIME,
    rubberMaxLoad: RUBBER_INITIAL_MAX_LEN,
    ballMass: BALL_INITIAL_MASS,
    ballRadius: BALL_INITIAL_RADIUS,
    stretch: 0,
    dangerTime: 0
  });

  const targetsRef = useRef<Target[]>([]);
  const lastTargetUpdate = useRef<number>(0);
  const [currentStats, setCurrentStats] = useState<GameStats>(statsRef.current);
  const [fireworks, setFireworks] = useState<FireworkInstance[]>([]);

  const spawnTarget = useCallback((type: TargetType = TargetType.YELLOW) => {
    const newTarget: Target = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      pos: {
        x: 50 + Math.random() * (CANVAS_WIDTH - 100),
        y: 100 + Math.random() * (CANVAS_HEIGHT - 200)
      },
      radius: 15
    };
    targetsRef.current = [...targetsRef.current, newTarget];
  }, []);

  useEffect(() => {
    spawnTarget();
    spawnTarget();
    spawnTarget();
  }, [spawnTarget]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    anchorPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  useEffect(() => {
    let animationFrameId: number;
    let lastTickTime = performance.now();
    let tickAccumulator = 0;

    const updatePhysics = () => {
      const stats = statsRef.current;
      if (stats.timeLeft <= 0) return;

      const dx = ballPos.current.x - anchorPos.current.x;
      const dy = ballPos.current.y - anchorPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const stretchRatio = dist / stats.rubberMaxLoad;
      stats.stretch = stretchRatio;

      const fRubber = settings.rubberK * (dist - settings.naturalLen);
      const angle = Math.atan2(dy, dx);
      
      const ax = -(fRubber * Math.cos(angle)) / stats.ballMass;
      const ay = (stats.ballMass * settings.gravity - fRubber * Math.sin(angle)) / stats.ballMass;

      ballVel.current.x += ax;
      ballVel.current.y += ay;

      const speed = Math.sqrt(ballVel.current.x**2 + ballVel.current.y**2);
      if (speed > 25) {
        ballVel.current.x = (ballVel.current.x / speed) * 25;
        ballVel.current.y = (ballVel.current.y / speed) * 25;
      }

      ballPos.current.x += ballVel.current.x;
      ballPos.current.y += ballVel.current.y;

      if (ballPos.current.x - stats.ballRadius < 0) {
        ballPos.current.x = stats.ballRadius;
        ballVel.current.x *= -settings.collisionDamp;
      } else if (ballPos.current.x + stats.ballRadius > CANVAS_WIDTH) {
        ballPos.current.x = CANVAS_WIDTH - stats.ballRadius;
        ballVel.current.x *= -settings.collisionDamp;
      }

      if (ballPos.current.y - stats.ballRadius < 0) {
        ballPos.current.y = stats.ballRadius;
        ballVel.current.y *= -settings.collisionDamp;
      } else if (ballPos.current.y + stats.ballRadius > CANVAS_HEIGHT) {
        ballPos.current.y = CANVAS_HEIGHT - stats.ballRadius;
        ballVel.current.y *= -settings.collisionDamp;
      }

      targetsRef.current.forEach((t, index) => {
        const tdx = ballPos.current.x - t.pos.x;
        const tdy = ballPos.current.y - t.pos.y;
        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
        
        if (tdist < stats.ballRadius + t.radius) {
          handleHit(t, index);
        }
      });

      if (stats.stretch > DANGER_THRESHOLD) {
        stats.dangerTime += 1 / TICK_RATE;
        stats.rubberMaxLoad -= 0.05;
        if (stats.dangerTime > BREAK_TIME_LIMIT) {
          stats.timeLeft = 0;
        }
      } else {
        stats.dangerTime = Math.max(0, stats.dangerTime - 0.1);
      }

      stats.timeLeft -= 1 / TICK_RATE;
      if (stats.timeLeft <= 0) {
        onGameOver(stats.score);
      }

      if (performance.now() - lastTargetUpdate.current > 50) {
        setCurrentStats({ ...stats });
        lastTargetUpdate.current = performance.now();
      }
    };

    const handleHit = (t: Target, index: number) => {
      const stats = statsRef.current;
      stats.combo += 1;
      
      let grade: EvalGrade = 'FAIL';
      let multiplier = 1;
      
      const s = stats.stretch;
      if (s >= 0.9) {
        grade = 'PERFECT';
        stats.perfectStreak += 1;
        multiplier = Math.min(200, stats.perfectStreak * 10);
      } else if (s >= 0.7) {
        grade = 'GREAT';
        stats.perfectStreak = 0;
        multiplier = 5;
      } else if (s >= 0.4) {
        grade = 'GOOD';
        stats.perfectStreak = 0;
        multiplier = 1;
      } else if (s > 0.05) {
        grade = 'OK';
        stats.perfectStreak = 0;
        multiplier = 1;
      } else {
        grade = 'FAIL';
        stats.perfectStreak = 0;
        multiplier = 0;
      }

      // Trigger Visual Effects
      const fwId = Math.random().toString(36).substr(2, 9);
      setFireworks(prev => [...prev, { id: fwId, x: t.pos.x, y: t.pos.y, grade }]);
      // Longer timeout for the Kanji to stay visible for 2s
      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== fwId));
      }, 2000);

      let points = 100 * multiplier;
      stats.score += points;

      if (t.type === TargetType.YELLOW) {
        stats.timeLeft += 1;
      } else if (t.type === TargetType.GREEN) {
        stats.rubberMaxLoad = Math.min(400, stats.rubberMaxLoad + 15);
        stats.timeLeft += 2;
      } else if (t.type === TargetType.RED) {
        stats.ballMass += 0.2;
        stats.ballRadius += 2;
        stats.timeLeft += 3;
      }

      targetsRef.current.splice(index, 1);
      
      const roll = Math.random();
      let nextType = TargetType.YELLOW;
      if (roll > 0.92) nextType = TargetType.RED;
      else if (roll > 0.8) nextType = TargetType.GREEN;
      
      spawnTarget(nextType);
    };

    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      for (let i = 0; i < CANVAS_WIDTH; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
      }
      for (let i = 0; i < CANVAS_HEIGHT; i += 50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_WIDTH, i); ctx.stroke();
      }

      const stats = statsRef.current;
      ctx.lineWidth = 3;
      const stretchColor = stats.stretch > 1 ? '#ef4444' : stats.stretch > 0.8 ? '#f59e0b' : '#3b82f6';
      ctx.strokeStyle = stretchColor;
      ctx.setLineDash(stats.stretch > 1 ? [5, 5] : []);
      ctx.beginPath();
      ctx.moveTo(anchorPos.current.x, anchorPos.current.y);
      ctx.lineTo(ballPos.current.x, ballPos.current.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(anchorPos.current.x, anchorPos.current.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#3b82f6';
      ctx.shadowBlur = stats.stretch > 0.9 ? 20 : 0;
      ctx.shadowColor = '#3b82f6';
      ctx.beginPath();
      ctx.arc(ballPos.current.x, ballPos.current.y, stats.ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      targetsRef.current.forEach(t => {
        ctx.fillStyle = TARGET_COLORS[t.type];
        ctx.shadowBlur = 10;
        ctx.shadowColor = TARGET_COLORS[t.type];
        ctx.beginPath();
        ctx.arc(t.pos.x, t.pos.y, t.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    const loop = (time: number) => {
      const deltaTime = time - lastTickTime;
      lastTickTime = time;
      tickAccumulator += deltaTime;

      while (tickAccumulator >= TICK_TIME) {
        updatePhysics();
        tickAccumulator -= TICK_TIME;
      }

      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [settings, onGameOver, spawnTarget]);

  return (
    <div 
      ref={containerRef}
      className="relative cursor-none border-4 border-zinc-800 rounded-lg overflow-hidden bg-black shadow-2xl"
      onMouseMove={handleMouseMove}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
    >
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
      />
      
      {/* CSS Effects Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {fireworks.map(f => (
          <FireworkEffect key={f.id} x={f.x} y={f.y} grade={f.grade} />
        ))}
      </div>

      <UIOverlay stats={currentStats} />
    </div>
  );
};

export default GameCanvas;
