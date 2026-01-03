
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Background3DProps {
  stretch: number;
  userAvatar?: string;
}

const Background3D: React.FC<Background3DProps> = ({ stretch, userAvatar }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cssGridRef = useRef<HTMLDivElement>(null);
  const stretchRef = useRef(stretch);

  useEffect(() => {
    stretchRef.current = stretch;
    if (cssGridRef.current) {
      const constantSpeed = 1.5; 
      cssGridRef.current.style.setProperty('--scroll-speed', `${2 / constantSpeed}s`);
      
      const hue = stretch > 0.9 ? 0 : 215;
      const intensity = 0.3 + stretch * 0.7;
      cssGridRef.current.style.setProperty('--grid-color', `hsla(${hue}, 80%, 60%, ${0.4 * intensity})`);
    }
  }, [stretch]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null; 
    scene.fog = new THREE.FogExp2(0x010103, 0.04);

    const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); 
    mountRef.current.appendChild(renderer.domElement);

    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);

    const wallGeo = new THREE.PlaneGeometry(60, 200, 1, 10);
    const wallMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        stretch: { value: 0 },
        baseColor: { value: new THREE.Color(0x0a1535) },
        pulseColor: { value: new THREE.Color(0x3b82f6) },
        dangerColor: { value: new THREE.Color(0xff2222) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float time;
        uniform float stretch;
        uniform vec3 baseColor;
        uniform vec3 pulseColor;
        uniform vec3 dangerColor;

        void main() {
          float constantSpeed = 1.5;
          float yPos = fract(vUv.y * 5.0 + time * constantSpeed);
          float pulse = pow(1.0 - abs(yPos - 0.5) * 2.0, 16.0);
          float grid = step(0.98, fract(vUv.y * 40.0 + time * constantSpeed * 2.0));
          vec3 color = mix(baseColor, dangerColor, clamp(stretch - 0.8, 0.0, 1.0) * 1.5);
          vec3 finalPulseColor = mix(pulseColor, dangerColor, clamp(stretch - 0.8, 0.0, 1.0));
          vec3 finalColor = color + (finalPulseColor * pulse * 2.0) + (finalPulseColor * grid * 0.5);
          float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
          gl_FragColor = vec4(finalColor * edge, 0.4); // More transparent to see icon through back wall
        }
      `,
      side: THREE.DoubleSide,
      transparent: true
    });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -15;
    tunnelGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = 15;
    tunnelGroup.add(rightWall);

    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.z = -30;
    tunnelGroup.add(backWall);

    const light = new THREE.PointLight(0x3b82f6, 100, 100);
    light.position.set(0, 5, 5);
    scene.add(light);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const s = stretchRef.current;
      wallMat.uniforms.time.value += 0.005;
      wallMat.uniforms.stretch.value = s;
      
      light.intensity = 50 + s * 200;
      light.color.setHex(s > 0.9 ? 0xff4444 : 0x3b82f6);
      
      if (s > 0.9) {
        camera.position.x = (Math.random() - 0.5) * 0.05 * s;
        camera.position.y = (Math.random() - 0.5) * 0.05 * s;
      } else {
        camera.position.x *= 0.9;
        camera.position.y *= 0.9;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      wallGeo.dispose();
      wallMat.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#010103]">
      {/* Layer 1: Three.js Tunnel - Bottom layer */}
      <div ref={mountRef} className="absolute inset-0 z-0 opacity-100 pointer-events-none" />

      {/* Layer 2: Centered Nostr Avatar - Above 3D Tunnel, Below Grid */}
      {userAvatar && (
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-all duration-1000 overflow-hidden"
          style={{
            opacity: 0.4,
            filter: 'grayscale(0.3) brightness(0.6) contrast(1.1)' 
          }}
        >
           <div 
            className="w-48 h-48 md:w-96 md:h-96 rounded-full overflow-hidden border-2 border-blue-500/20 shadow-[0_0_80px_rgba(59,130,246,0.2)]"
            style={{
              backgroundImage: `url(${userAvatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      )}

      {/* Layer 3: Effects, Grid, and Vignette - Top of background stack */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.05) 50%, transparent)',
            backgroundSize: '100% 200px',
            animation: 'streak-scroll 0.8s linear infinite'
          }}
        />
      </div>

      <div 
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 40%'
        }}
      >
        <div 
          ref={cssGridRef}
          className="absolute inset-0 origin-center opacity-40"
          style={{
            transform: 'rotateX(60deg) translateY(-50%) scale(2.5)',
            backgroundImage: `
              linear-gradient(to bottom, var(--grid-color, rgba(59, 130, 246, 0.15)) 1px, transparent 1px),
              linear-gradient(to right, var(--grid-color, rgba(59, 130, 246, 0.15)) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            animation: 'background-scroll var(--scroll-speed, 1.5s) linear infinite',
          } as React.CSSProperties}
        />
      </div>

      <div className="absolute inset-0 z-30 pointer-events-none shadow-[inset_0_0_300px_rgba(0,0,0,0.95)]" />

      <style>{`
        @keyframes background-scroll {
          from { background-position: 0 0; }
          to { background-position: 0 100px; }
        }
        @keyframes streak-scroll {
          from { transform: translateY(-200px); }
          to { transform: translateY(200px); }
        }
      `}</style>
    </div>
  );
};

export default Background3D;
