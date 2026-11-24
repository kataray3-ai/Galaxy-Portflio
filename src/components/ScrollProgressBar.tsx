import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

export function ScrollProgressBar() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-[2.5px] bg-white/[0.04]"
    >
      <motion.div
        style={{
          scaleX: prefersReducedMotion ? scrollYProgress : smoothProgress,
        }}
        className="h-full w-full origin-left bg-gradient-to-r from-[#D97706] via-[#F5B041] to-[#FDE68A] shadow-[0_0_10px_rgba(245,176,65,0.65)]"
      />
    </div>
  );
}
