import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createSpiralGalaxyPoints, detectSoftwareWebGL } from '../three/observatoryBuilder';

const _targetRot = { x: 0, y: 0 };

function createNebulaSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    grad.addColorStop(0.35, 'rgba(125, 211, 252, 0.2)');
    grad.addColorStop(0.7, 'rgba(245, 176, 65, 0.06)');
    grad.addColorStop(1, 'rgba(4, 6, 14, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface ShootingStar {
  line: THREE.Line;
  velocity: THREE.Vector3;
  active: boolean;
  cooldown: number;
  life: number;
  maxLife: number;
}

export function GalaxyBackdrop() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const mountEl = containerRef.current;
    if (!mountEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareWebGL();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#04060E');
    scene.fog = new THREE.FogExp2('#04060E', 0.011);

    const camera = new THREE.PerspectiveCamera(
      56,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 10.5, 24);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setContextLost(true);
      return;
    }

    const pixelRatio = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    mountEl.appendChild(renderer.domElement);

    // 1. Vivid Spiral Galaxy Core & Arms
    const { points: galaxyPoints, material: galaxyMat } = createSpiralGalaxyPoints(
      14000,
      38,
      4
    );
    galaxyMat.uniforms.uPixelRatio.value = pixelRatio;
    galaxyMat.uniforms.uBaseSize.value = 46.0;
    galaxyPoints.rotation.x = 0.32;
    galaxyPoints.position.set(2.5, -1.5, -2);
    scene.add(galaxyPoints);

    // 2. Soft Luminous Nebula Cloud Layer
    const nebulaCount = 120;
    const nebPos = new Float32Array(nebulaCount * 3);
    const nebColors = new Float32Array(nebulaCount * 3);
    const warmCol = new THREE.Color('#F5B041');
    const coolCol = new THREE.Color('#38BDF8');
    const deepCol = new THREE.Color('#6366F1');
    const tmpCol = new THREE.Color();

    for (let i = 0; i < nebulaCount; i++) {
      const r = 2 + Math.pow(Math.random(), 1.2) * 26;
      const arm = (i % 4) * ((Math.PI * 2) / 4);
      const angle = arm + r * 0.42 + (Math.random() - 0.5) * 0.65;
      nebPos[i * 3] = Math.cos(angle) * r;
      nebPos[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
      nebPos[i * 3 + 2] = Math.sin(angle) * r;

      const t = r / 28;
      if (t < 0.4) {
        tmpCol.copy(warmCol).lerp(coolCol, t / 0.4);
      } else {
        tmpCol.copy(coolCol).lerp(deepCol, (t - 0.4) / 0.6);
      }
      nebColors[i * 3] = tmpCol.r;
      nebColors[i * 3 + 1] = tmpCol.g;
      nebColors[i * 3 + 2] = tmpCol.b;
    }

    const nebGeo = new THREE.BufferGeometry();
    nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
    nebGeo.setAttribute('color', new THREE.BufferAttribute(nebColors, 3));
    const nebSpriteTex = createNebulaSpriteTexture();
    const nebMat = new THREE.PointsMaterial({
      size: 6.5,
      map: nebSpriteTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nebulaPoints = new THREE.Points(nebGeo, nebMat);
    nebulaPoints.rotation.x = 0.32;
    nebulaPoints.position.copy(galaxyPoints.position);
    scene.add(nebulaPoints);

    // 3. Distant Outer Starfield Shell
    const dustCount = 2200;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = 42 + Math.random() * 55;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dustPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dustPos[i * 3 + 1] = r * Math.cos(phi);
      dustPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: new THREE.Color('#CBD5E1'),
      size: 0.16,
      transparent: true,
      opacity: 0.68,
      sizeAttenuation: true,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 4. Periodic Shooting Stars
    const shootingStars: ShootingStar[] = [];
    for (let i = 0; i < 3; i++) {
      const starPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(-2.6, 1.1, 0)];
      const starGeo = new THREE.BufferGeometry().setFromPoints(starPts);
      const starMat = new THREE.LineBasicMaterial({
        color: new THREE.Color('#FDE68A'),
        transparent: true,
        opacity: 0,
      });
      const line = new THREE.Line(starGeo, starMat);
      scene.add(line);
      shootingStars.push({
        line,
        velocity: new THREE.Vector3(16, -7, 2),
        active: false,
        cooldown: 1.5 + i * 3.2,
        life: 0,
        maxLife: 1.15,
      });
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    let pointerX = 0;
    let pointerY = 0;
    let scrollRatio = 0;

    const handlePointerMove = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollRatio = window.scrollY / maxScroll;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const pr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h);
      galaxyMat.uniforms.uPixelRatio.value = pr;
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (sync && state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        galaxyMat.uniforms.uTime.value = elapsed;
        galaxyPoints.rotation.y += delta * 0.048;
        nebulaPoints.rotation.y += delta * 0.048;
        dustPoints.rotation.y -= delta * 0.012;

        _targetRot.x = 0.32 + pointerY * 0.08 + scrollRatio * 0.25;
        _targetRot.y = pointerX * 0.1;

        galaxyPoints.rotation.x = THREE.MathUtils.damp(
          galaxyPoints.rotation.x,
          _targetRot.x,
          3.0,
          delta
        );
        nebulaPoints.rotation.x = galaxyPoints.rotation.x;

        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetRot.y * 3.2, 2.4, delta);
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          10.5 - scrollRatio * 4.5,
          2.4,
          delta
        );
        camera.lookAt(0, 0, 0);

        // Animate shooting stars
        for (let i = 0; i < shootingStars.length; i++) {
          const star = shootingStars[i];
          const mat = star.line.material as THREE.LineBasicMaterial;
          if (!star.active) {
            star.cooldown -= delta;
            if (star.cooldown <= 0) {
              star.active = true;
              star.life = 0;
              star.line.position.set(
                -18 + Math.random() * 14,
                9 + Math.random() * 8,
                -10 - Math.random() * 12
              );
              star.velocity.set(16 + Math.random() * 8, -7 - Math.random() * 4, 2);
            }
          } else {
            star.life += delta;
            star.line.position.addScaledVector(star.velocity, delta);
            const progress = star.life / star.maxLife;
            mat.opacity = Math.sin(progress * Math.PI) * 0.85;
            if (star.life >= star.maxLife) {
              star.active = false;
              star.cooldown = 3.5 + Math.random() * 5.0;
              mat.opacity = 0;
            }
          }
        }
      }

      renderer.render(scene, camera);

      if (prefersReducedMotion) return;
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      galaxyPoints.geometry.dispose();
      galaxyMat.dispose();
      nebGeo.dispose();
      nebMat.dispose();
      nebSpriteTex.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      shootingStars.forEach((s) => {
        s.line.geometry.dispose();
        (s.line.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mountEl) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (contextLost) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#121c38_0%,#04060E_68%)]"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    />
  );
}
