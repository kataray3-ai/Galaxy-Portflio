import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { SKILL_PLANETS } from '../data/portfolioData';
import { cosmicAudio } from '../audio/cosmicAudio';
import { GalaxyObservatory } from './GalaxyObservatory';

interface ConstellationSectionProps {
  onInquireTopic: (topic: string) => void;
}

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  twinklePhase: number;
}

interface SupernovaParticle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  drag: number;
  gravity: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  isStar: boolean;
  rotation: number;
  rotSpeed: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const TRAIL_COLORS = ['#F5B041', '#FDE68A', '#7DD3FC', '#FFFFFF'];
const SUPERNOVA_COLORS = [
  '#F5B041',
  '#FDE68A',
  '#38BDF8',
  '#FB923C',
  '#A78BFA',
  '#34D399',
  '#F472B6',
  '#FFFFFF',
];

export function ConstellationSection({ onInquireTopic }: ConstellationSectionProps) {
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trailWrapperRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<TrailParticle[]>([]);
  const supernovaParticlesRef = useRef<SupernovaParticle[]>([]);
  const shockwavesRef = useRef<ShockwaveRing[]>([]);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = trailCanvasRef.current;
    const wrapper = trailWrapperRef.current;
    if (!canvas || !wrapper || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const syncCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrapper.clientWidth || 1200;
      const h = wrapper.clientHeight || 620;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    syncCanvasSize();

    const ro = new ResizeObserver(syncCanvasSize);
    ro.observe(wrapper);

    let rafId = 0;

    const animateParticles = () => {
      const w = wrapper.clientWidth || 1200;
      const h = wrapper.clientHeight || 620;
      ctx.clearRect(0, 0, w, h);

      // 1. Expanding supernova shockwave rings & core flashes
      const rings = shockwavesRef.current;
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.radius += (ring.maxRadius - ring.radius) * 0.14 + 1.2;
        ring.alpha -= 0.032;

        if (ring.alpha <= 0.01 || ring.radius >= ring.maxRadius) {
          rings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, ring.alpha);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = Math.max(0.8, 3.0 * ring.alpha);
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Soft inner flash during early expansion
        if (ring.radius < ring.maxRadius * 0.45) {
          const flashGrad = ctx.createRadialGradient(
            ring.x,
            ring.y,
            0,
            ring.x,
            ring.y,
            ring.radius * 0.85
          );
          flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
          flashGrad.addColorStop(0.45, 'rgba(245, 176, 65, 0.25)');
          flashGrad.addColorStop(1, 'rgba(4, 6, 14, 0)');
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius * 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Supernova physics-based burst particles
      const bursts = supernovaParticlesRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.prevX = b.x;
        b.prevY = b.y;
        b.vx *= b.drag;
        b.vy = b.vy * b.drag + b.gravity;
        b.x += b.vx;
        b.y += b.vy;
        b.rotation += b.rotSpeed;
        b.alpha -= b.decay;

        if (b.alpha <= 0.01) {
          bursts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, b.alpha));

        // Velocity streak tail
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.size * 0.85;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(b.prevX, b.prevY);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // Radial glow
        const glowGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size * 2.8);
        glowGrad.addColorStop(0, '#FFFFFF');
        glowGrad.addColorStop(0.35, b.color);
        glowGrad.addColorStop(1, 'rgba(4, 6, 14, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // 4-point star flare on primary fragments
        if (b.isStar) {
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rotation);
          ctx.fillStyle = '#FFFFFF';
          const arm = b.size * 2.2;
          const core = b.size * 0.34;
          ctx.beginPath();
          ctx.moveTo(0, -arm);
          ctx.lineTo(core, -core);
          ctx.lineTo(arm, 0);
          ctx.lineTo(core, core);
          ctx.lineTo(0, arm);
          ctx.lineTo(-core, core);
          ctx.lineTo(-arm, 0);
          ctx.lineTo(-core, -core);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      // 3. Cursor-tracking star-trail particles
      const list = particlesRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.twinklePhase += 0.18;
        p.alpha -= p.decay;

        if (p.alpha <= 0.01) {
          list.splice(i, 1);
          continue;
        }

        const twinkle = 0.72 + 0.28 * Math.sin(p.twinklePhase);
        const drawAlpha = Math.max(0, Math.min(1, p.alpha * twinkle));

        ctx.save();
        ctx.globalAlpha = drawAlpha;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.6);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.35, p.color);
        grad.addColorStop(1, 'rgba(4, 6, 14, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.6, 0, Math.PI * 2);
        ctx.fill();

        if (p.size >= 2.2) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          const arm = p.size * 1.9;
          const core = p.size * 0.35;
          ctx.moveTo(p.x, p.y - arm);
          ctx.lineTo(p.x + core, p.y - core);
          ctx.lineTo(p.x + arm, p.y);
          ctx.lineTo(p.x + core, p.y + core);
          ctx.lineTo(p.x, p.y + arm);
          ctx.lineTo(p.x - core, p.y + core);
          ctx.lineTo(p.x - arm, p.y);
          ctx.lineTo(p.x - core, p.y - core);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      rafId = requestAnimationFrame(animateParticles);
    };

    rafId = requestAnimationFrame(animateParticles);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [prefersReducedMotion]);

  const spawnTrailAt = (x: number, y: number, count: number) => {
    const list = particlesRef.current;
    for (let i = 0; i < count; i++) {
      if (list.length >= 110) list.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.65;
      list.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.18,
        size: 1.4 + Math.random() * 2.2,
        alpha: 0.85 + Math.random() * 0.15,
        decay: 0.024 + Math.random() * 0.02,
        color: TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)],
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  };

  const triggerSupernova = (x: number, y: number) => {
    if (prefersReducedMotion) return;

    const shockwaves = shockwavesRef.current;
    if (shockwaves.length >= 6) shockwaves.shift();
    shockwaves.push(
      {
        x,
        y,
        radius: 6,
        maxRadius: 115,
        alpha: 0.88,
        color: '#F5B041',
      },
      {
        x,
        y,
        radius: 4,
        maxRadius: 80,
        alpha: 0.72,
        color: '#7DD3FC',
      }
    );

    const bursts = supernovaParticlesRef.current;
    const count = 42;
    for (let i = 0; i < count; i++) {
      if (bursts.length >= 220) bursts.shift();
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const speed = 2.6 + Math.pow(Math.random(), 0.75) * 7.2;
      bursts.push({
        x,
        y,
        prevX: x,
        prevY: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        drag: 0.935 + Math.random() * 0.025,
        gravity: 0.035 + Math.random() * 0.025,
        size: 1.6 + Math.random() * 2.8,
        alpha: 0.95 + Math.random() * 0.05,
        decay: 0.017 + Math.random() * 0.016,
        color: SUPERNOVA_COLORS[Math.floor(Math.random() * SUPERNOVA_COLORS.length)],
        isStar: i % 3 === 0,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.14,
      });
    }
  };

  const handleCanvasPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleCanvasPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const downPos = pointerDownPosRef.current;
    pointerDownPosRef.current = null;
    if (!downPos) return;

    // Ignore drags (orbit camera movement) and bottom control dock clicks
    const dragDist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    if (dragDist > 6) return;

    const targetEl = e.target as HTMLElement | null;
    if (targetEl?.closest('[data-no-supernova="true"]')) return;

    const wrapper = trailWrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    triggerSupernova(e.clientX - rect.left, e.clientY - rect.top);
    cosmicAudio.playHoverSparkle(Math.floor(Math.random() * 6));
  };

  const handleCanvasPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const wrapper = trailWrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const prev = lastPointerRef.current;
    if (prev) {
      const dist = Math.hypot(x - prev.x, y - prev.y);
      const steps = Math.min(5, Math.max(1, Math.floor(dist / 14)));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        spawnTrailAt(prev.x + (x - prev.x) * t, prev.y + (y - prev.y) * t, 2);
      }
    } else {
      spawnTrailAt(x, y, 3);
    }

    lastPointerRef.current = { x, y };
  };

  const handleCanvasPointerLeave = () => {
    lastPointerRef.current = null;
  };

  const handleSelectPlanet = (planetId: string | null) => {
    setSelectedPlanetId(planetId);
    if (planetId) {
      const idx = SKILL_PLANETS.findIndex((p) => p.id === planetId);
      cosmicAudio.playPlanetChime(idx >= 0 ? idx : 0);
    }
  };

  const activePlanet =
    SKILL_PLANETS.find((p) => p.id === selectedPlanetId) ?? SKILL_PLANETS[0];

  return (
    <section
      id="constellation"
      className="mx-auto max-w-[1280px] px-6 py-16 md:py-24"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-medium text-[#F5B041]">
            Interactive 3D Skill Observatory
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
            Orbiting Expertise Across Six Core Disciplines
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-slate-400">
          Drag to rotate the 3D galaxy, scroll to zoom, or click anywhere to trigger a supernova and inspect the tools, workflows, and outcomes behind each planet.
        </p>
      </div>

      {/* 3D WebGL Viewport with Cursor-Tracking Star-Trail & Click Supernova Overlay */}
      <div
        ref={trailWrapperRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerUp={handleCanvasPointerUp}
        onPointerMove={handleCanvasPointerMove}
        onPointerLeave={handleCanvasPointerLeave}
        className="relative"
      >
        <GalaxyObservatory
          planets={SKILL_PLANETS}
          selectedPlanetId={selectedPlanetId}
          onSelectPlanet={handleSelectPlanet}
        />

        <canvas
          ref={trailCanvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 h-full w-full rounded-2xl"
        />
      </div>

      {/* Unobstructed Planet Dossier Panel below canvas */}
      <motion.div
        key={activePlanet.id}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 rounded-2xl border border-white/10 bg-[#0B101E]/82 p-6 md:p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="font-mono-tabular text-[#F5B041]">
                Planet {activePlanet.index}
              </span>
              <span aria-hidden="true">/</span>
              <span>{activePlanet.sector}</span>
            </div>

            <h3 className="mt-2 font-display text-2xl font-bold text-white">
              {activePlanet.name}
            </h3>
            <p className="mt-1 font-editorial text-lg italic text-[#7DD3FC]">
              {activePlanet.headline}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {activePlanet.summary}
            </p>

            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-xs font-medium text-slate-400">Core Stack</p>
              <p className="mt-1.5 text-sm text-slate-100">
                {activePlanet.tools.join(' · ')}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 lg:border-l lg:border-white/10 lg:pl-8 flex flex-col justify-between h-full">
            <div>
              <p className="text-xs font-medium text-slate-400">
                Execution &amp; Training Deliverables
              </p>
              <ul className="mt-3 space-y-3">
                {activePlanet.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B041]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">Target Impact</p>
                <p className="mt-0.5 font-mono-tabular text-sm font-medium text-white">
                  {activePlanet.outcomeMetric}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onInquireTopic(activePlanet.name)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#F5B041]/50 bg-[#F5B041]/10 px-4 py-2 text-xs font-semibold text-[#F5B041] hover:bg-[#F5B041] hover:text-[#04060E] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Discuss {activePlanet.shortName} Strategy</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
