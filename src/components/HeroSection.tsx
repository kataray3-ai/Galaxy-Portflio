import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { CONTACT_DETAILS, HERO_METRICS } from '../data/portfolioData';
import { cosmicAudio } from '../audio/cosmicAudio';

interface HeroSectionProps {
  onExploreConstellation: () => void;
  onViewPrograms: () => void;
}

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  rotation: number;
  rotSpeed: number;
  color: string;
}

const STAR_COLORS = ['#F5B041', '#FDE68A', '#7DD3FC', '#FFFFFF'];

function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;

  ctx.beginPath();
  const inner = radius * 0.28;
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? radius : inner;
    const angle = (i * Math.PI) / 4;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Soft center glow
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.restore();
}

export function HeroSection({
  onExploreConstellation,
  onViewPrograms,
}: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const starCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<StarParticle[]>([]);
  const hoveredRef = useRef(false);

  useEffect(() => {
    hoveredRef.current = isImageHovered;
  }, [isImageHovered]);

  // Interactive 2D star-sparkle & constellation burst loop for portrait hover
  useEffect(() => {
    const canvas = starCanvasRef.current;
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();

    const ro = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let rafId = 0;
    let ambientTimer = 0;

    const renderStars = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 440;
      const h = parent ? parent.clientHeight : 460;

      ctx.clearRect(0, 0, w, h);

      // Ambient perimeter twinkling stars while hovered
      if (hoveredRef.current) {
        ambientTimer++;
        if (ambientTimer % 6 === 0 && particlesRef.current.length < 48) {
          particlesRef.current.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.65,
            vy: -0.35 - Math.random() * 0.75,
            size: 4 + Math.random() * 7,
            alpha: 0.95,
            decay: 0.015 + Math.random() * 0.012,
            rotation: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          });
        }
      }

      const list = particlesRef.current;

      // Subtle constellation lines connecting nearby star sparkles
      ctx.lineWidth = 0.75;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const dx = list[i].x - list[j].x;
          const dy = list[i].y - list[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 82) {
            const lineAlpha = (1 - dist / 82) * Math.min(list[i].alpha, list[j].alpha) * 0.45;
            ctx.strokeStyle = `rgba(245, 176, 65, ${lineAlpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(list[i].x, list[i].y);
            ctx.lineTo(list[j].x, list[j].y);
            ctx.stroke();
          }
        }
      }

      // Update & draw 4-point stars
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          list.splice(i, 1);
          continue;
        }
        drawFourPointStar(ctx, p.x, p.y, p.size, p.rotation, p.color, p.alpha);
      }

      rafId = requestAnimationFrame(renderStars);
    };

    rafId = requestAnimationFrame(renderStars);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [prefersReducedMotion]);

  const spawnCursorStars = (x: number, y: number, count: number) => {
    if (prefersReducedMotion) return;
    for (let i = 0; i < count; i++) {
      if (particlesRef.current.length >= 64) particlesRef.current.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.4;
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 26,
        y: y + (Math.random() - 0.5) * 26,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        size: 5 + Math.random() * 8,
        alpha: 1,
        decay: 0.018 + Math.random() * 0.015,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      });
    }
  };

  const handleCardPointerEnter = (e: MouseEvent<HTMLDivElement>) => {
    setIsImageHovered(true);
    cosmicAudio.playHoverSparkle(4);
    const rect = e.currentTarget.getBoundingClientRect();
    spawnCursorStars(e.clientX - rect.left, e.clientY - rect.top, 14);
  };

  const handleCardPointerMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    if (!prefersReducedMotion) {
      const nx = localX / rect.width - 0.5;
      const ny = localY / rect.height - 0.5;
      setTilt({
        rotateX: -ny * 10,
        rotateY: nx * 10,
      });
      if (Math.random() < 0.45) {
        spawnCursorStars(localX, localY, 2);
      }
    }
  };

  const handleCardPointerLeave = () => {
    setIsImageHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <section
      id="overview"
      className="relative mx-auto max-w-[1280px] px-6 pt-12 pb-16 md:pt-16 md:pb-24"
    >
      {/* 2-Column Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
        {/* Left Column: Editorial Typography & Primary Action */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-center"
        >
          <p className="text-xs md:text-sm font-medium tracking-wide text-[#F5B041]">
            Google &amp; Meta Certified <span aria-hidden="true" className="mx-2 text-slate-500">·</span> Digital Marketing &amp; Generative AI Trainer <span aria-hidden="true" className="mx-2 text-slate-500">·</span> Delhi NCR, India
          </p>

          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-[3.6rem] font-bold leading-[1.08] tracking-tight text-slate-50 [text-wrap:balance]">
            Turning Clicks Into Measurable Growth Across the Digital Cosmos
          </h1>

          <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-slate-300">
            I&apos;m <span className="font-semibold text-white">Yamini Katara</span>—founder of{' '}
            <a
              href={CONTACT_DETAILS.website}
              target="_blank"
              rel="noreferrer"
              className="text-[#7DD3FC] underline decoration-white/25 underline-offset-4 hover:decoration-[#7DD3FC]"
            >
              digitalyamini.com
            </a>
            . Over the past 8+ years, I&apos;ve bridged performance marketing with modern Generative AI workflows—scaling businesses online and mentoring 10,000+ learners through agency-style execution.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={onExploreConstellation}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F5B041] px-6 py-3 text-sm font-semibold text-[#04060E] hover:bg-[#F7C266] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B041]"
            >
              <span>Explore 3D Constellation</span>
              <ArrowDownRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onViewPrograms}
              className="inline-flex items-center gap-1.5 py-2 text-sm font-medium text-slate-200 hover:text-[#F5B041] transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              <span>Browse Courses &amp; Consulting</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span>ChatGPT &amp; Canva AI Workflows</span>
            <span aria-hidden="true">·</span>
            <span>Google &amp; Meta Ads</span>
            <span aria-hidden="true">·</span>
            <span>Technical &amp; Local SEO</span>
            <span aria-hidden="true">·</span>
            <span>GA4 &amp; Tag Manager</span>
          </div>
        </motion.div>

        {/* Right Column: Interactive 3D-Tilt Celestial Portrait Frame with Star Hover Effects */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex items-stretch"
        >
          <div
            onMouseEnter={handleCardPointerEnter}
            onMouseMove={handleCardPointerMove}
            onMouseLeave={handleCardPointerLeave}
            style={{
              perspective: '1100px',
            }}
            className="relative w-full min-h-[380px] lg:min-h-[460px] flex items-center justify-center"
          >
            {/* Outer SVG celestial orbital ring + glowing star nodes on hover */}
            <svg
              aria-hidden="true"
              viewBox="0 0 400 400"
              className={`pointer-events-none absolute inset-0 m-auto h-[110%] w-[110%] transition-colors duration-300 animate-orbit-slow ${
                isImageHovered ? 'text-[#F5B041]/55' : 'text-white/15'
              }`}
            >
              <circle
                cx="200"
                cy="200"
                r="186"
                fill="none"
                stroke="currentColor"
                strokeWidth={isImageHovered ? '1.5' : '1'}
                strokeDasharray="6 10"
              />
              <circle cx="386" cy="200" r={isImageHovered ? '6' : '4'} fill="#F5B041" />
              <circle cx="14" cy="200" r={isImageHovered ? '4.5' : '2.5'} fill="#FDE68A" />
            </svg>

            <svg
              aria-hidden="true"
              viewBox="0 0 400 400"
              className={`pointer-events-none absolute inset-0 m-auto h-[96%] w-[96%] transition-colors duration-300 animate-orbit-reverse ${
                isImageHovered ? 'text-[#7DD3FC]/55' : 'text-[#7DD3FC]/20'
              }`}
            >
              <circle
                cx="200"
                cy="200"
                r="175"
                fill="none"
                stroke="currentColor"
                strokeWidth={isImageHovered ? '1.5' : '1'}
                strokeDasharray="2 14"
              />
              <circle cx="25" cy="200" r={isImageHovered ? '5.5' : '3.5'} fill="#7DD3FC" />
              <circle cx="200" cy="25" r={isImageHovered ? '4.5' : '2.5'} fill="#FFFFFF" />
            </svg>

            {/* Interactive 3D Tilted Portrait Container */}
            <div
              style={{
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className={`relative w-full h-full max-w-[440px] rounded-2xl border bg-[#0B101E] overflow-hidden transition-all duration-300 ${
                isImageHovered
                  ? 'border-[#F5B041]/70 shadow-[0_0_55px_-12px_rgba(245,176,65,0.5)]'
                  : 'border-white/15 shadow-2xl'
              }`}
            >
              {imgFailed ? (
                <div className="flex h-full min-h-[380px] flex-col items-center justify-center bg-[linear-gradient(135deg,#0B101E_0%,#17203A_100%)] p-8 text-center">
                  <span className="font-display text-3xl font-bold text-[#F5B041]">YK</span>
                  <p className="mt-2 font-display text-lg font-semibold text-white">
                    Yamini Katara
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Founder, Digital Yamini
                  </p>
                </div>
              ) : (
                <img
                  src="/assets/aistudio/Yamini_Katara_6ba38104.png"
                  alt="Yamini Katara, Digital Marketing and Generative AI Trainer at Digital Yamini"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className={`h-full w-full min-h-[380px] object-cover object-top transition-transform duration-500 ease-out ${
                    isImageHovered ? 'scale-[1.03]' : 'scale-100'
                  }`}
                />
              )}

              {/* Subtle starlight radial sheen when hovered */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(245,176,65,0.18),rgba(125,211,252,0.12)_45%,transparent_75%)] transition-opacity duration-300 ${
                  isImageHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Interactive Star Sparkle & Constellation Canvas Overlay */}
              <canvas
                ref={starCanvasRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
              />

              {/* Static Starlight Constellation SVG for reduced-motion hover */}
              {prefersReducedMotion && isImageHovered && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 200"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <line x1="30" y1="40" x2="75" y2="25" stroke="#F5B041" strokeOpacity="0.5" strokeWidth="0.8" />
                  <line x1="75" y1="25" x2="165" y2="48" stroke="#7DD3FC" strokeOpacity="0.5" strokeWidth="0.8" />
                  <circle cx="30" cy="40" r="2.2" fill="#FDE68A" />
                  <circle cx="75" cy="25" r="2.5" fill="#F5B041" />
                  <circle cx="165" cy="48" r="2.2" fill="#7DD3FC" />
                </svg>
              )}

              {/* Measured bottom contrast scrim */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#04060E]/95 via-[#04060E]/55 to-transparent px-6 pt-16 pb-5">
                <p className="font-display text-lg font-semibold text-white">
                  Yamini Katara
                </p>
                <p className="mt-0.5 text-xs text-slate-300">
                  Digital Strategist <span aria-hidden="true">·</span> Corporate &amp; Campus Trainer <span aria-hidden="true">·</span> New Delhi
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full-width 4-Column Quantitative Impact Strip below Hero Split */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-y border-white/10 divide-y sm:divide-y-0 sm:divide-x divide-white/10 bg-[#0B101E]/75 rounded-xl overflow-hidden">
        {HERO_METRICS.map((metric) => (
          <div key={metric.label} className="px-6 py-5">
            <p className="font-mono-tabular text-2xl md:text-[1.75rem] font-semibold text-white">
              {metric.value}
            </p>
            <p className="mt-1 text-sm font-medium text-[#F5B041]">
              {metric.label}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {metric.context}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
