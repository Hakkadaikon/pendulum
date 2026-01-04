
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Background3DProps {
  stretch: number;
  userAvatar?: string;
}

const Background3D: React.FC<Background3DProps> = ({ stretch, userAvatar }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stretchRef = useRef(stretch);

  useEffect(() => {
    stretchRef.current = stretch;
  }, [stretch]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    // Earthy dark background and fog
    const bgColor = 0x0c0805;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.05);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
    mountRef.current.appendChild(renderer.domElement);

    // Create a rugged wall material using shaders
    const wallGeo = new THREE.PlaneGeometry(60, 60, 128, 128);
    const wallMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        stretch: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vElevation;
        uniform float time;
        uniform float stretch;

        // Classic 2D Noise
        vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float pnoise(vec2 P) {
          vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
          vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
          Pi = mod(Pi, 289.0);
          vec4 ix = Pi.xzxz;
          vec4 iy = Pi.yyww;
          vec4 fx = Pf.xzxz;
          vec4 fy = Pf.yyww;
          vec4 i = permute(permute(ix) + iy);
          vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0;
          vec4 gy = abs(gx) - 0.5;
          vec4 tx = floor(gx + 0.5);
          gx = gx - tx;
          vec2 g00 = vec2(gx.x,gy.x);
          vec2 g10 = vec2(gx.y,gy.y);
          vec2 g01 = vec2(gx.z,gy.z);
          vec2 g11 = vec2(gx.w,gy.w);
          vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g10, g10), dot(g01, g01), dot(g11, g11));
          g00 *= norm.x; g10 *= norm.y; g01 *= norm.z; g11 *= norm.w;
          float n00 = dot(g00, vec2(fx.x, fy.x));
          float n10 = dot(g10, vec2(fx.y, fy.y));
          float n01 = dot(g01, vec2(fx.z, fy.z));
          float n11 = dot(g11, vec2(fx.w, fy.w));
          vec2 fade_xy = fade(Pf.xy);
          vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
          float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
          return 2.3 * n_xy;
        }

        void main() {
          vUv = uv;
          
          // Upward scrolling effect
          float scrollSpeed = 0.4;
          vec2 noiseUv = uv * 3.0 + vec2(0.0, -time * scrollSpeed);
          
          // Create layered rugged noise
          float elevation = pnoise(noiseUv) * 1.5;
          elevation += pnoise(noiseUv * 2.0) * 0.5;
          elevation += pnoise(noiseUv * 4.0) * 0.2;
          
          vElevation = elevation;
          
          vec3 newPos = position;
          newPos.z += elevation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vElevation;
        uniform float time;
        uniform float stretch;

        void main() {
          // Normal mapping simulation via elevation gradients
          float d = 0.01;
          float slope = vElevation * 0.5;
          
          // Earthy Palette
          vec3 baseColor = vec3(0.08, 0.06, 0.04); // Dark soil
          vec3 rockColor = vec3(0.28, 0.22, 0.16); // Earthy rock/brown
          
          // Add highlights on peaks
          float diffuse = clamp(vElevation, 0.0, 1.0);
          vec3 color = mix(baseColor, rockColor, diffuse);
          
          // Constant warm glow in crevices (Independent of stretch for steady brightness)
          vec3 glowColor = vec3(0.45, 0.25, 0.08); // Warm amber soil-glow
          float creviceGlow = smoothstep(0.3, -0.8, vElevation);
          
          // Fixed intensity (0.5) to keep background brightness constant
          color += glowColor * creviceGlow * 0.5;
          
          // Scannline/Grid effect overlay (warm tones)
          float grid = step(0.98, fract(vUv.y * 50.0 - time * 0.5)) * 0.04;
          color += glowColor * grid;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.z = -5;
    scene.add(wall);

    // Static warm light following the general center
    const lightColor = 0xccaa88; // Warm earthy light
    const light = new THREE.PointLight(lightColor, 150, 50); // Increased base intensity
    light.position.set(0, 0, 10);
    scene.add(light);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const s = stretchRef.current;
      
      wallMat.uniforms.time.value += 0.01;
      wallMat.uniforms.stretch.value = s;
      
      // Light intensity is now static as requested
      // light.intensity = 150; // Already set at creation
      
      // Camera shake on high tension remains for game feel (not brightness)
      if (s > 0.95) {
        camera.position.x = (Math.random() - 0.5) * 0.1 * s;
        camera.position.y = (Math.random() - 0.5) * 0.1 * s;
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
      wallMat.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
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
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* User Avatar Overlay (Sharp but subtle watermark) */}
      {userAvatar && (
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden"
        >
           <div 
            className="w-72 h-72 md:w-[450px] md:h-[450px] rounded-full overflow-hidden border border-white/5 opacity-30 brightness-50 contrast-110 saturate-[0.8]"
            style={{
              backgroundImage: `url(${userAvatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'luminosity'
            }}
          />
        </div>
      )}

      {/* Vignette and Dark overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />
    </div>
  );
};

export default Background3D;
