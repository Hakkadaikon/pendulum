
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  TICK_TIME, 
  TICK_RATE, 
  BALL_INITIAL_RADIUS, 
  BALL_INITIAL_MASS, 
  RUBBER_INITIAL_MAX_LEN,
  INITIAL_TIME,
  DANGER_THRESHOLD,
  BREAK_TIME_LIMIT,
  TARGET_COLORS,
  COMBO_TIME_LIMIT,
  SPECIAL_EFFECT_DURATION,
  formatScore
} from '../constants';
import { GameSettings, Vector2D, Target, TargetType, GameStats } from '../types';
import UIOverlay from './UIOverlay';
import FireworkEffect, { EvalGrade } from './FireworkEffect';
import Background3D from './Background3D';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FireworkEval {
  id: string;
  x: number;
  y: number;
  grade: EvalGrade;
  stretchPercent: number;
}

interface GameCanvasProps {
  settings: GameSettings;
  onGameOver: (score: number) => void;
  userAvatar?: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ settings, onGameOver, userAvatar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentStretch, setCurrentStretch] = useState(0);
  
  const activeMinX = 0;
  const activeMaxX = dimensions.width;

  const hasMoved = useRef(false);
  const isBroken = useRef(false);
  const breakTimeRef = useRef(0);
  
  const targetInputPos = useRef<Vector2D>({ x: 0, y: 0 });
  const anchorPos = useRef<Vector2D>({ x: 0, y: 0 });
  const prevAnchorPos = useRef<Vector2D>({ x: 0, y: 0 });
  
  const ballPos = useRef<Vector2D>({ x: 0, y: 0 });
  const prevBallPos = useRef<Vector2D>({ x: 0, y: 0 });
  const ballVel = useRef<Vector2D>({ x: 0, y: 0 });
  const ballRotation = useRef(0);
  const targetRotation = useRef(0);
  
  const statsRef = useRef<GameStats>({
    score: 0, combo: 0, comboTimer: 0, perfectStreak: 0, timeLeft: INITIAL_TIME,
    rubberMaxLoad: RUBBER_INITIAL_MAX_LEN, ballMass: BALL_INITIAL_MASS,
    ballRadius: BALL_INITIAL_RADIUS, stretch: 0, dangerTime: 0,
    whiteEffectTimer: 0, blackEffectTimer: 0
  });

  const targetsRef = useRef<Target[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const [evals, setEvals] = useState<FireworkEval[]>([]);

  const uiRefs = {
    score: useRef<HTMLDivElement>(null),
    timer: useRef<HTMLDivElement>(null),
    combo: useRef<HTMLDivElement>(null),
    comboTimerContainer: useRef<HTMLDivElement>(null),
    comboTimerBar: useRef<HTMLDivElement>(null),
    whiteTimerBar: useRef<HTMLDivElement>(null),
    blackTimerBar: useRef<HTMLDivElement>(null),
    whiteTimerContainer: useRef<HTMLDivElement>(null),
    blackTimerContainer: useRef<HTMLDivElement>(null),
    perfect: useRef<HTMLDivElement>(null),
    gauge: useRef<HTMLDivElement>(null),
    gaugeContainer: useRef<HTMLDivElement>(null),
    tensionLabel: useRef<HTMLSpanElement>(null),
    tensionValue: useRef<HTMLDivElement>(null),
    dangerBorder: useRef<HTMLDivElement>(null),
  };

  const lastUIUpdate = useRef(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  const spawnTarget = useCallback((type: TargetType = TargetType.YELLOW) => {
    if (dimensions.width === 0) return;
    const margin = 50;
    const newTarget: Target = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      pos: {
        x: margin + Math.random() * (dimensions.width - margin * 2),
        y: 100 + Math.random() * (dimensions.height - 200)
      },
      radius: 15,
      vel: (type === TargetType.WHITE || statsRef.current.whiteEffectTimer > 0) ? {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
      } : undefined
    };
    targetsRef.current = [...targetsRef.current, newTarget];
  }, [dimensions]);

  useEffect(() => {
    if (dimensions.width > 0 && targetsRef.current.length === 0) {
      spawnTarget(); spawnTarget(); spawnTarget();
    }
  }, [spawnTarget, dimensions]);

  const updateInputPos = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetInputPos.current = { 
      x: clientX - rect.left, 
      y: clientY - rect.top 
    };
    
    if (!hasMoved.current && dimensions.width > 0) {
      anchorPos.current = { ...targetInputPos.current };
      prevAnchorPos.current = { ...targetInputPos.current };
      ballPos.current = { x: anchorPos.current.x, y: anchorPos.current.y + 100 };
      prevBallPos.current = { ...ballPos.current };
      hasMoved.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => updateInputPos(e.clientX, e.clientY);
  const handleTouchMove = (e: React.TouchEvent) => e.touches[0] && updateInputPos(e.touches[0].clientX, e.touches[0].clientY);

  const spawnParticles = (x: number, y: number, color: string, count: number, spread: number, sizeMult: number) => {
    const maxParticles = 400;
    const currentCount = particlesRef.current.length;
    const actualCount = Math.min(count, maxParticles - currentCount);
    
    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * spread * 0.05;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 0.5 + Math.random() * 0.8,
        color,
        size: (1 + Math.random() * 3) * sizeMult
      });
    }
  };

  useEffect(() => {
    if (dimensions.width === 0) return;
    
    let animationFrameId: number;
    let lastTime = performance.now();
    let accumulator = 0;
    let lastStatsSync = 0;

    const updatePhysics = () => {
      if (!hasMoved.current) return;
      const stats = statsRef.current;

      if (isBroken.current) {
        if (performance.now() - breakTimeRef.current > 4000) {
          onGameOver(stats.score); return;
        }
      } else if (stats.timeLeft <= 0) {
        onGameOver(stats.score); return;
      }

      if (stats.whiteEffectTimer > 0) stats.whiteEffectTimer -= 1 / TICK_RATE;
      if (stats.blackEffectTimer > 0) stats.blackEffectTimer -= 1 / TICK_RATE;

      prevAnchorPos.current = { ...anchorPos.current };
      prevBallPos.current = { ...ballPos.current };
      anchorPos.current.x += (targetInputPos.current.x - anchorPos.current.x) * 0.35;
      anchorPos.current.y += (targetInputPos.current.y - anchorPos.current.y) * 0.35;
      const dx = ballPos.current.x - anchorPos.current.x;
      const dy = ballPos.current.y - anchorPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      stats.stretch = isBroken.current ? 0 : dist / stats.rubberMaxLoad;
      
      const currentGravity = stats.blackEffectTimer > 0 ? -settings.gravity : settings.gravity;
      
      let ax = 0, ay = stats.ballMass * currentGravity;
      if (!isBroken.current) {
        const fRubber = settings.rubberK * (dist - settings.naturalLen);
        const angle = Math.atan2(dy, dx);
        ax -= (fRubber * Math.cos(angle)); ay -= (fRubber * Math.sin(angle));
      }
      ballVel.current.x = (ballVel.current.x + ax / stats.ballMass) * 0.994;
      ballVel.current.y = (ballVel.current.y + ay / stats.ballMass) * 0.994;
      ballRotation.current += Math.sqrt(ballVel.current.x**2 + ballVel.current.y**2) * 0.05;
      targetRotation.current += 0.04;
      ballPos.current.x += ballVel.current.x; ballPos.current.y += ballVel.current.y;

      if (ballPos.current.x - stats.ballRadius < activeMinX) { ballPos.current.x = activeMinX + stats.ballRadius; ballVel.current.x *= -settings.collisionDamp; }
      else if (ballPos.current.x + stats.ballRadius > activeMaxX) { ballPos.current.x = activeMaxX - stats.ballRadius; ballVel.current.x *= -settings.collisionDamp; }
      if (ballPos.current.y - stats.ballRadius < 0) { ballPos.current.y = stats.ballRadius; ballVel.current.y *= -settings.collisionDamp; }
      else if (ballPos.current.y + stats.ballRadius > dimensions.height) { ballPos.current.y = dimensions.height - stats.ballRadius; ballVel.current.y *= -settings.collisionDamp; }

      if (stats.combo > 0) {
        stats.comboTimer -= 1 / TICK_RATE;
        if (stats.comboTimer <= 0) { stats.combo = 0; stats.comboTimer = 0; stats.perfectStreak = 0; }
      }

      targetsRef.current.forEach((t, index) => {
        if (t.vel) {
          t.pos.x += t.vel.x;
          t.pos.y += t.vel.y;
          if (t.pos.x - t.radius < 0 || t.pos.x + t.radius > dimensions.width) { t.vel.x *= -1; }
          if (t.pos.y - t.radius < 0 || t.pos.y + t.radius > dimensions.height) { t.vel.y *= -1; }
        }

        const tdx = ballPos.current.x - t.pos.x;
        const tdy = ballPos.current.y - t.pos.y;
        if (Math.sqrt(tdx*tdx + tdy*tdy) < stats.ballRadius + t.radius) handleHit(t, index);
      });

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.05;
        p.vx *= 0.98; p.vy *= 0.98;
        p.life -= 0.015 / p.maxLife;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
      }

      if (!isBroken.current) {
        if (stats.stretch > DANGER_THRESHOLD) {
          stats.dangerTime += 1 / TICK_RATE;
          stats.rubberMaxLoad -= 0.02;
          if (stats.dangerTime > BREAK_TIME_LIMIT) { isBroken.current = true; breakTimeRef.current = performance.now(); }
        } else {
          stats.dangerTime = Math.max(0, stats.dangerTime - 0.12);
        }
        stats.timeLeft -= 1 / TICK_RATE;
      }
    };

    const handleHit = (t: Target, index: number) => {
      const stats = statsRef.current;
      stats.combo += 1;
      stats.comboTimer = COMBO_TIME_LIMIT;
      let grade: EvalGrade = 'FAIL', baseScore = 0;
      const s = isBroken.current ? 0 : stats.stretch;
      const stretchPercent = Math.round(s * 100);

      let pCount = 20, pSpread = 50, pSize = 1;
      if (!isBroken.current) {
        if (s >= 0.9) { grade = 'PERFECT'; stats.perfectStreak += 1; baseScore = 1000; pCount = 200; pSpread = 200; pSize = 2.0; }
        else if (s >= 0.7) { grade = 'GREAT'; baseScore = 500; pCount = 100; pSpread = 150; pSize = 1.5; }
        else if (s >= 0.4) { grade = 'GOOD'; baseScore = 200; pCount = 50; pSpread = 100; pSize = 1.0; }
        else if (s > 0.05) { grade = 'OK'; baseScore = 100; pCount = 20; pSpread = 60; pSize = 0.6; }
      } else { grade = 'OK'; baseScore = 100; }

      const color = TARGET_COLORS[t.type];
      spawnParticles(t.pos.x, t.pos.y, color, pCount, pSpread, pSize);

      const evalId = Math.random().toString(36).substr(2, 9);
      setEvals(prev => [...prev, { id: evalId, x: t.pos.x, y: t.pos.y, grade, stretchPercent }]);
      setTimeout(() => setEvals(p => p.filter(e => e.id !== evalId)), 2500);

      const multiplier = Math.pow(2, Math.floor(stats.combo / 5));
      stats.score += Math.floor(baseScore * multiplier);

      if (!isBroken.current) {
        const canRecoverTime = stats.timeLeft > 10;
        if (t.type === TargetType.YELLOW) { if (canRecoverTime) stats.timeLeft += 1.0; } 
        else if (t.type === TargetType.GREEN) { stats.rubberMaxLoad = Math.min(400, stats.rubberMaxLoad + 15); if (canRecoverTime) stats.timeLeft += 2.0; } 
        else if (t.type === TargetType.RED) { stats.ballMass += 0.2; stats.ballRadius += 2; if (canRecoverTime) stats.timeLeft += 3.0; } 
        else if (t.type === TargetType.WHITE) {
          stats.whiteEffectTimer = SPECIAL_EFFECT_DURATION;
          targetsRef.current.forEach(target => { if (!target.vel) target.vel = { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 }; });
        } 
        else if (t.type === TargetType.BLACK) { stats.blackEffectTimer = SPECIAL_EFFECT_DURATION; }
      }
      
      targetsRef.current.splice(index, 1);
      const roll = Math.random();
      if (stats.combo >= 10 && Math.random() < 0.15) { spawnTarget(Math.random() > 0.5 ? TargetType.WHITE : TargetType.BLACK); } 
      else { spawnTarget(roll > 0.92 ? TargetType.RED : roll > 0.8 ? TargetType.GREEN : TargetType.YELLOW); }
    };

    const draw = (alpha: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;
      const w = dimensions.width, h = dimensions.height;
      
      // Use clearRect to allow the 3D background to show through
      ctx.clearRect(0, 0, w, h);

      if (!hasMoved.current) {
        ctx.fillStyle = '#475569'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('MOVE TO INITIALIZE SYSTEM', w / 2, h / 2); return;
      }

      const drawAnchor = {
        x: prevAnchorPos.current.x + (anchorPos.current.x - prevAnchorPos.current.x) * alpha,
        y: prevAnchorPos.current.y + (anchorPos.current.y - prevAnchorPos.current.y) * alpha
      };
      const drawBall = {
        x: prevBallPos.current.x + (ballPos.current.x - prevBallPos.current.x) * alpha,
        y: prevBallPos.current.y + (ballPos.current.y - prevBallPos.current.y) * alpha
      };

      const s = statsRef.current;
      const color = isBroken.current ? '#ef4444' : s.stretch > 1 ? '#ef4444' : s.stretch > 0.9 ? '#facc15' : '#3b82f6';
      
      ctx.globalCompositeOperation = 'lighter';
      for (const p of particlesRef.current) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
      }
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';

      if (!isBroken.current) {
        ctx.lineWidth = 1 + (s.stretch * 1.5); ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(drawAnchor.x, drawAnchor.y); ctx.lineTo(drawBall.x, drawBall.y); ctx.stroke();
      }

      ctx.save();
      ctx.translate(drawAnchor.x, drawAnchor.y);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
      
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(drawBall.x, drawBall.y);
      ctx.rotate(ballRotation.current);
      
      if (s.stretch > 0.9 || isBroken.current) {
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(0, 0, s.ballRadius + 4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      const mainBallGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s.ballRadius);
      mainBallGrad.addColorStop(0, color);
      mainBallGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)'); 
      
      ctx.fillStyle = mainBallGrad;
      ctx.beginPath(); ctx.arc(0, 0, s.ballRadius, 0, Math.PI * 2); ctx.fill();

      // Sharp patterns
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, s.ballRadius * 0.5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s.ballRadius * 0.8, 0); ctx.lineTo(-s.ballRadius * 0.2, 0);
      ctx.moveTo(s.ballRadius * 0.2, 0); ctx.lineTo(s.ballRadius * 0.8, 0);
      ctx.moveTo(0, -s.ballRadius * 0.8); ctx.lineTo(0, -s.ballRadius * 0.2);
      ctx.moveTo(0, s.ballRadius * 0.2); ctx.lineTo(0, s.ballRadius * 0.8);
      ctx.stroke();
      ctx.restore();

      for (const t of targetsRef.current) {
        const tColor = TARGET_COLORS[t.type];
        ctx.save();
        ctx.translate(t.pos.x, t.pos.y);
        ctx.rotate(targetRotation.current);

        ctx.globalAlpha = 0.15;
        ctx.fillStyle = tColor;
        ctx.beginPath(); ctx.arc(0, 0, t.radius + 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;

        const targetGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, t.radius);
        targetGrad.addColorStop(0, tColor);
        targetGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

        ctx.fillStyle = targetGrad;
        ctx.beginPath(); ctx.arc(0, 0, t.radius, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, t.radius * 0.8, t.radius * 0.2, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0, 0, t.radius * 0.2, t.radius * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      const now = performance.now();
      if (now - lastStatsSync > 60) { 
        setCurrentStretch(s.stretch); 
        updateUI();
        lastStatsSync = now; 
      }
    };

    const updateUI = () => {
      const s = statsRef.current;
      if (uiRefs.score.current) uiRefs.score.current.textContent = formatScore(s.score, settings.scoreDisplayMode);
      if (uiRefs.timer.current) uiRefs.timer.current.textContent = Math.max(0, s.timeLeft).toFixed(1);
      
      if (uiRefs.combo.current && uiRefs.comboTimerContainer.current && uiRefs.comboTimerBar.current) {
        if (s.combo > 0) {
          const multiplier = Math.pow(2, Math.floor(s.combo / 5));
          const multText = multiplier > 1 ? ` (x${multiplier})` : '';
          if (uiRefs.combo.current.style.display !== 'block') uiRefs.combo.current.style.display = 'block';
          uiRefs.combo.current.textContent = `${s.combo} Hits${multText}`;
          if (uiRefs.comboTimerContainer.current.style.display !== 'block') uiRefs.comboTimerContainer.current.style.display = 'block';
          const progress = Math.max(0, (s.comboTimer / COMBO_TIME_LIMIT) * 100);
          uiRefs.comboTimerBar.current.style.width = `${progress}%`;
        } else {
          if (uiRefs.combo.current.style.display !== 'none') uiRefs.combo.current.style.display = 'none';
          if (uiRefs.comboTimerContainer.current.style.display !== 'none') uiRefs.comboTimerContainer.current.style.display = 'none';
        }
      }

      if (uiRefs.whiteTimerContainer.current && uiRefs.whiteTimerBar.current) {
        if (s.whiteEffectTimer > 0) {
          if (uiRefs.whiteTimerContainer.current.style.display !== 'block') uiRefs.whiteTimerContainer.current.style.display = 'block';
          uiRefs.whiteTimerBar.current.style.width = `${(s.whiteEffectTimer / SPECIAL_EFFECT_DURATION) * 100}%`;
        } else {
          if (uiRefs.whiteTimerContainer.current.style.display !== 'none') uiRefs.whiteTimerContainer.current.style.display = 'none';
        }
      }
      if (uiRefs.blackTimerContainer.current && uiRefs.blackTimerBar.current) {
        if (s.blackEffectTimer > 0) {
          if (uiRefs.blackTimerContainer.current.style.display !== 'block') uiRefs.blackTimerContainer.current.style.display = 'block';
          uiRefs.blackTimerBar.current.style.width = `${(s.blackEffectTimer / SPECIAL_EFFECT_DURATION) * 100}%`;
        } else {
          if (uiRefs.blackTimerContainer.current.style.display !== 'none') uiRefs.blackTimerContainer.current.style.display = 'none';
        }
      }

      if (uiRefs.perfect.current) {
        if (s.perfectStreak > 0) {
          if (uiRefs.perfect.current.style.display !== 'block') uiRefs.perfect.current.style.display = 'block';
          uiRefs.perfect.current.textContent = `Perfect x${s.perfectStreak}`;
        } else {
          if (uiRefs.perfect.current.style.display !== 'none') uiRefs.perfect.current.style.display = 'none';
        }
      }

      if (uiRefs.gauge.current) {
        const stretchPercent = Math.min(100, s.stretch * 100);
        uiRefs.gauge.current.style.width = isBroken.current ? '0%' : `${stretchPercent}%`;
      }
      if (uiRefs.tensionValue.current) uiRefs.tensionValue.current.textContent = isBroken.current ? 'SNAPPED' : `${Math.round(s.stretch * 100)}%`;
    };

    const loop = (time: number) => {
      accumulator += time - lastTime; lastTime = time;
      while (accumulator >= TICK_TIME) { updatePhysics(); accumulator -= TICK_TIME; }
      draw(accumulator / TICK_TIME);
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [settings, onGameOver, spawnTarget, dimensions]);

  return (
    <div ref={containerRef} className="relative w-full h-full cursor-none overflow-hidden bg-black" onMouseMove={handleMouseMove} onTouchMove={handleTouchMove}>
      <Background3D stretch={currentStretch} userAvatar={userAvatar} />
      <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} className="relative z-10 block" />
      <div className="absolute inset-0 pointer-events-none z-20">
        {evals.map(e => <FireworkEffect key={e.id} x={e.x} y={e.y} grade={e.grade} stretchPercent={e.stretchPercent} />)}
      </div>
      <UIOverlay refs={uiRefs} />
    </div>
  );
};

export default GameCanvas;
