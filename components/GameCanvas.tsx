
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
  TARGET_COLORS
} from '../constants';
import { GameSettings, Vector2D, Target, TargetType, GameStats } from '../types';
import UIOverlay from './UIOverlay';
import FireworkEffect, { EvalGrade } from './FireworkEffect';
import Background3D from './Background3D';

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
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [currentStretch, setCurrentStretch] = useState(0);
  
  const isPC = dimensions.width > 768;
  const wallWidth = isPC ? dimensions.width * 0.2 : 0;
  const activeMinX = wallWidth;
  const activeMaxX = dimensions.width - wallWidth;

  const hasMoved = useRef(false);
  
  const targetInputPos = useRef<Vector2D>({ x: window.innerWidth / 2, y: 100 });
  const anchorPos = useRef<Vector2D>({ x: window.innerWidth / 2, y: 100 });
  const prevAnchorPos = useRef<Vector2D>({ x: window.innerWidth / 2, y: 100 });
  
  const ballPos = useRef<Vector2D>({ x: window.innerWidth / 2, y: 200 });
  const prevBallPos = useRef<Vector2D>({ x: window.innerWidth / 2, y: 200 });
  const ballVel = useRef<Vector2D>({ x: 0, y: 0 });
  const ballRotation = useRef(0);
  const targetRotation = useRef(0);
  
  const statsRef = useRef<GameStats>({
    score: 0, combo: 0, perfectStreak: 0, timeLeft: INITIAL_TIME,
    rubberMaxLoad: RUBBER_INITIAL_MAX_LEN, ballMass: BALL_INITIAL_MASS,
    ballRadius: BALL_INITIAL_RADIUS, stretch: 0, dangerTime: 0
  });

  const targetsRef = useRef<Target[]>([]);
  const [fireworks, setFireworks] = useState<FireworkInstance[]>([]);

  const uiRefs = {
    score: useRef<HTMLDivElement>(null),
    timer: useRef<HTMLDivElement>(null),
    combo: useRef<HTMLDivElement>(null),
    perfect: useRef<HTMLDivElement>(null),
    gauge: useRef<HTMLDivElement>(null),
    gaugeContainer: useRef<HTMLDivElement>(null),
    tensionLabel: useRef<HTMLSpanElement>(null),
    tensionValue: useRef<HTMLDivElement>(null),
    dangerBorder: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const spawnTarget = useCallback((type: TargetType = TargetType.YELLOW) => {
    const margin = 50;
    const newTarget: Target = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      pos: {
        x: activeMinX + margin + Math.random() * (activeMaxX - activeMinX - margin * 2),
        y: 100 + Math.random() * (window.innerHeight - 200)
      },
      radius: 15
    };
    targetsRef.current = [...targetsRef.current, newTarget];
  }, [activeMinX, activeMaxX]);

  useEffect(() => {
    spawnTarget(); spawnTarget(); spawnTarget();
  }, [spawnTarget]);

  const updateInputPos = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    targetInputPos.current = { x: clientX - rect.left, y: clientY - rect.top };
    if (!hasMoved.current) {
      anchorPos.current = { ...targetInputPos.current };
      prevAnchorPos.current = { ...targetInputPos.current };
      ballPos.current = { x: anchorPos.current.x, y: anchorPos.current.y + 100 };
      prevBallPos.current = { ...ballPos.current };
      hasMoved.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => updateInputPos(e.clientX, e.clientY);
  const handleTouchMove = (e: React.TouchEvent) => e.touches[0] && updateInputPos(e.touches[0].clientX, e.touches[0].clientY);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let accumulator = 0;
    let lastStatsSync = 0;

    const updatePhysics = () => {
      if (!hasMoved.current) return;
      const stats = statsRef.current;
      if (stats.timeLeft <= 0) return;

      prevAnchorPos.current = { ...anchorPos.current };
      prevBallPos.current = { ...ballPos.current };

      anchorPos.current.x += (targetInputPos.current.x - anchorPos.current.x) * 0.35;
      anchorPos.current.y += (targetInputPos.current.y - anchorPos.current.y) * 0.35;

      const dx = ballPos.current.x - anchorPos.current.x;
      const dy = ballPos.current.y - anchorPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      stats.stretch = dist / stats.rubberMaxLoad;

      const fRubber = settings.rubberK * (dist - settings.naturalLen);
      const angle = Math.atan2(dy, dx);
      const ax = -(fRubber * Math.cos(angle)) / stats.ballMass;
      const ay = (stats.ballMass * settings.gravity - fRubber * Math.sin(angle)) / stats.ballMass;

      ballVel.current.x = (ballVel.current.x + ax) * 0.994;
      ballVel.current.y = (ballVel.current.y + ay) * 0.994;

      // Update main ball rotation based on velocity
      const speed = Math.sqrt(ballVel.current.x**2 + ballVel.current.y**2);
      ballRotation.current += speed * 0.05;

      // Update global target rotation
      targetRotation.current += 0.04;

      ballPos.current.x += ballVel.current.x;
      ballPos.current.y += ballVel.current.y;

      if (ballPos.current.x - stats.ballRadius < activeMinX) {
        ballPos.current.x = activeMinX + stats.ballRadius;
        ballVel.current.x *= -settings.collisionDamp;
      } else if (ballPos.current.x + stats.ballRadius > activeMaxX) {
        ballPos.current.x = activeMaxX - stats.ballRadius;
        ballVel.current.x *= -settings.collisionDamp;
      }
      if (ballPos.current.y - stats.ballRadius < 0) {
        ballPos.current.y = stats.ballRadius;
        ballVel.current.y *= -settings.collisionDamp;
      } else if (ballPos.current.y + stats.ballRadius > window.innerHeight) {
        ballPos.current.y = window.innerHeight - stats.ballRadius;
        ballVel.current.y *= -settings.collisionDamp;
      }

      targetsRef.current.forEach((t, index) => {
        const tdx = ballPos.current.x - t.pos.x;
        const tdy = ballPos.current.y - t.pos.y;
        if (Math.sqrt(tdx*tdx + tdy*tdy) < stats.ballRadius + t.radius) handleHit(t, index);
      });

      if (stats.stretch > DANGER_THRESHOLD) {
        stats.dangerTime += 1 / TICK_RATE;
        stats.rubberMaxLoad -= 0.02;
        if (stats.dangerTime > BREAK_TIME_LIMIT) stats.timeLeft = 0;
      } else {
        stats.dangerTime = Math.max(0, stats.dangerTime - 0.12);
      }

      stats.timeLeft -= 1 / TICK_RATE;
      if (stats.timeLeft <= 0) onGameOver(stats.score);
    };

    const handleHit = (t: Target, index: number) => {
      const stats = statsRef.current;
      stats.combo += 1;
      let grade: EvalGrade = 'FAIL';
      let mult = 0;
      const s = stats.stretch;

      if (s >= 0.9) { grade = 'PERFECT'; stats.perfectStreak += 1; mult = Math.min(200, stats.perfectStreak * 10); }
      else if (s >= 0.7) { grade = 'GREAT'; stats.perfectStreak = 0; mult = 5; }
      else if (s >= 0.4) { grade = 'GOOD'; stats.perfectStreak = 0; mult = 1; }
      else if (s > 0.05) { grade = 'OK'; stats.perfectStreak = 0; mult = 1; }

      const fwId = Math.random().toString(36).substr(2, 9);
      setFireworks(prev => [...prev, { id: fwId, x: t.pos.x, y: t.pos.y, grade }]);
      setTimeout(() => setFireworks(p => p.filter(f => f.id !== fwId)), 1500);

      stats.score += 100 * mult;
      if (t.type === TargetType.YELLOW) stats.timeLeft += 1.0;
      else if (t.type === TargetType.GREEN) { stats.rubberMaxLoad = Math.min(400, stats.rubberMaxLoad + 15); stats.timeLeft += 2.0; }
      else if (t.type === TargetType.RED) { stats.ballMass += 0.2; stats.ballRadius += 2; stats.timeLeft += 3.0; }

      targetsRef.current.splice(index, 1);
      const roll = Math.random();
      spawnTarget(roll > 0.92 ? TargetType.RED : roll > 0.8 ? TargetType.GREEN : TargetType.YELLOW);
    };

    const updateUI = () => {
      const s = statsRef.current;
      if (uiRefs.score.current) uiRefs.score.current.textContent = s.score.toLocaleString();
      if (uiRefs.timer.current) {
        uiRefs.timer.current.textContent = Math.max(0, s.timeLeft).toFixed(1);
        uiRefs.timer.current.className = s.timeLeft < 10 ? 'text-xl md:text-3xl font-black text-red-500 animate-pulse' : 'text-xl md:text-3xl font-black text-white';
      }
      if (uiRefs.combo.current) {
        uiRefs.combo.current.style.display = s.combo > 0 ? 'block' : 'none';
        uiRefs.combo.current.textContent = `${s.combo} Hits`;
      }
      if (uiRefs.perfect.current) {
        uiRefs.perfect.current.style.display = s.perfectStreak > 0 ? 'block' : 'none';
        uiRefs.perfect.current.textContent = `Perfect x${s.perfectStreak}`;
      }
      const stretchPercent = Math.min(100, s.stretch * 100);
      const isDanger = s.stretch > 1.0;
      const isPerfect = s.stretch >= 0.9 && s.stretch <= 1.0;

      if (uiRefs.gauge.current) {
        uiRefs.gauge.current.style.width = `${stretchPercent}%`;
        uiRefs.gauge.current.className = `h-full transition-all duration-75 ${isDanger ? 'bg-red-500 animate-pulse' : isPerfect ? 'bg-yellow-400' : 'bg-blue-500'}`;
      }
      if (uiRefs.tensionValue.current) uiRefs.tensionValue.current.textContent = `${Math.round(stretchPercent)}%`;
      if (uiRefs.tensionLabel.current) {
        uiRefs.tensionLabel.current.textContent = isDanger ? 'WARNING' : isPerfect ? 'PERFECT' : 'TENSION';
        uiRefs.tensionLabel.current.className = `text-[10px] md:text-xs font-bold uppercase tracking-widest ${isDanger ? 'text-red-500' : 'text-zinc-500'}`;
      }
      if (uiRefs.dangerBorder.current) uiRefs.dangerBorder.current.style.opacity = isDanger ? '1' : '0';
      
      if (performance.now() - lastStatsSync > 50) {
        setCurrentStretch(s.stretch);
        lastStatsSync = performance.now();
      }
    };

    const draw = (alpha: number) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const w = dimensions.width, h = dimensions.height;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      if (isPC) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, activeMinX, h);
        ctx.fillRect(activeMaxX, 0, activeMinX, h);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(activeMinX, 0); ctx.lineTo(activeMinX, h);
        ctx.moveTo(activeMaxX, 0); ctx.lineTo(activeMaxX, h);
        ctx.stroke();
        ctx.setLineDash([]);
      }

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
      const color = s.stretch > 1 ? '#ef4444' : s.stretch > 0.9 ? '#facc15' : '#3b82f6';
      
      // Rubber line
      ctx.lineWidth = 2 + (s.stretch * 2);
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.moveTo(drawAnchor.x, drawAnchor.y); ctx.lineTo(drawBall.x, drawBall.y); ctx.stroke();

      // Anchor
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(drawAnchor.x, drawAnchor.y, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = color;
      ctx.shadowBlur = 15; ctx.shadowColor = color;
      ctx.beginPath(); ctx.arc(drawAnchor.x, drawAnchor.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(drawAnchor.x, drawAnchor.y, 1.5, 0, Math.PI * 2); ctx.fill();

      // Ball (Main Pendulum Ball)
      ctx.save();
      ctx.translate(drawBall.x, drawBall.y);
      ctx.rotate(ballRotation.current);
      const mainBallGrad = ctx.createRadialGradient(-s.ballRadius * 0.3, -s.ballRadius * 0.3, s.ballRadius * 0.1, 0, 0, s.ballRadius);
      mainBallGrad.addColorStop(0, '#ffffff');
      mainBallGrad.addColorStop(0.3, color);
      mainBallGrad.addColorStop(1, '#000000');
      if (s.stretch > 0.9) { ctx.shadowBlur = 20; ctx.shadowColor = color; }
      ctx.fillStyle = mainBallGrad;
      ctx.beginPath(); ctx.arc(0, 0, s.ballRadius, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // Pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(-s.ballRadius * 0.8, 0); ctx.lineTo(s.ballRadius * 0.8, 0);
      ctx.moveTo(0, -s.ballRadius * 0.8); ctx.lineTo(0, s.ballRadius * 0.8);
      ctx.stroke();
      ctx.restore();

      // Targets (3D Spheres rotating in place)
      targetsRef.current.forEach(t => {
        const tColor = TARGET_COLORS[t.type];
        ctx.save();
        ctx.translate(t.pos.x, t.pos.y);
        ctx.rotate(targetRotation.current);

        // Spherical shading
        const targetGrad = ctx.createRadialGradient(
          -t.radius * 0.3, -t.radius * 0.3, t.radius * 0.1,
          0, 0, t.radius
        );
        targetGrad.addColorStop(0, '#ffffff'); // Glint
        targetGrad.addColorStop(0.3, tColor);   // Core color
        targetGrad.addColorStop(1, '#000000'); // Ambient occlusion/Shadow

        ctx.shadowBlur = 15; ctx.shadowColor = tColor;
        ctx.fillStyle = targetGrad;
        ctx.beginPath(); ctx.arc(0, 0, t.radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // Visual pattern to show rotation
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, t.radius * 0.8, t.radius * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, t.radius * 0.2, t.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      updateUI();
    };

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      accumulator += delta;

      while (accumulator >= TICK_TIME) {
        updatePhysics();
        accumulator -= TICK_TIME;
      }

      const alpha = accumulator / TICK_TIME;
      draw(alpha);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [settings, onGameOver, spawnTarget, dimensions, isPC, activeMinX, activeMaxX]);

  return (
    <div ref={containerRef} className="relative w-full h-full cursor-none overflow-hidden bg-black" onMouseMove={handleMouseMove} onTouchMove={handleTouchMove}>
      <Background3D stretch={currentStretch} />
      <canvas 
        ref={canvasRef} 
        width={dimensions.width} 
        height={dimensions.height} 
        className="relative z-10 block"
      />
      <div className="absolute inset-0 pointer-events-none z-20">
        {fireworks.map(f => <FireworkEffect key={f.id} x={f.x} y={f.y} grade={f.grade} />)}
      </div>
      <UIOverlay refs={uiRefs} />
    </div>
  );
};

export default GameCanvas;
