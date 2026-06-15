"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

const words = ["Spaces", "Craft", "Stories", "SMID"];

// Cinematic pacing — each word lingers ~1.05s before the next rises.
const WORD_INTERVAL = 1050;
const HOLD_AFTER_LAST = 950;
const TOTAL_DURATION = (words.length - 1) * WORD_INTERVAL + HOLD_AFTER_LAST;

/** Eases a 0→100 count over the given duration, synced to rAF. */
function useCounter(duration = 2200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeInOutCubic — a deliberate, steady climb rather than a quick snap.
      const eased =
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setCount(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return count;
}

const wordVariants: Variants = {
  initial: { y: "110%" },
  animate: { y: "0%", transition: { duration: 0.95, ease: [0.76, 0, 0.24, 1] } },
  exit: { y: "-110%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
};

const curtainVariants: Variants = {
  initial: { y: 0 },
  exit: {
    y: "-100%",
    transition: { duration: 1.3, ease: [0.76, 0, 0.24, 1], delay: 0.15 },
  },
};

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const count = useCounter(TOTAL_DURATION - 400);

  // Cycle the rotating words.
  useEffect(() => {
    if (index >= words.length - 1) return;
    const id = setTimeout(() => setIndex((i) => i + 1), WORD_INTERVAL);
    return () => clearTimeout(id);
  }, [index]);

  // Lock scroll only while the curtain is on screen. We tie the lock to `done`
  // (not just mount) because <Preloader> stays mounted after the intro — so a
  // cleanup-only reset would never fire and the page would be stuck unscrollable.
  useEffect(() => {
    const id = setTimeout(() => setDone(true), TOTAL_DURATION);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = done ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [done]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!done && (
        <motion.div
          key="preloader"
          variants={curtainVariants}
          initial="initial"
          exit="exit"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink px-6 py-8 text-bone md:px-12 md:py-12"
        >
          {/* Top row */}
          <div className="flex items-center justify-between font-sans text-[11px] uppercase tracking-[0.3em] text-bone/60">
            <span>Sree Mahalakshmi</span>
            <span>Est. Chennai</span>
          </div>

          {/* Center: rotating word mask */}
          <div className="flex items-end justify-center overflow-hidden">
            <div className="relative h-[1.1em] overflow-hidden font-serif text-[14vw] leading-none tracking-tightest md:text-[10vw]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={words[index]}
                  variants={wordVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="block"
                >
                  {words[index]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom: counter + progress line */}
          <div className="flex items-end justify-between">
            <span className="font-serif text-6xl tracking-tightest md:text-8xl">
              {count}
              <span className="align-top text-2xl text-clay md:text-3xl">%</span>
            </span>
            <div className="mb-3 hidden w-1/2 md:block">
              <motion.div
                className="h-px w-full origin-left bg-bone/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: count / 100 }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
