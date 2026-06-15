"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowDown } from "lucide-react";

// Short kinetic words rise one by one, then resolve into the full studio name.
const rotatingWords = ["Spaces", "Craft", "Stories"];

// Cinematic pacing — each beat lingers like a title card.
const WORD_REVEAL = 0.95; // s for a word to roll into place
const ROTATE_INTERVAL = 1800; // ms each word holds (must exceed WORD_REVEAL)
const NAME_HOLD = 2100; // ms the full name + scroll cue hold before the reveal
const ROTATE_TOTAL = rotatingWords.length * ROTATE_INTERVAL;

/** Eases a 0→100 count over the given duration, synced to rAF. */
function useCounter(duration: number) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeInOutCubic — a deliberate, steady climb rather than a quick snap.
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setCount(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return count;
}

// Append translateZ(0) so the masked text stays on its own GPU layer for the
// whole tween — this is what kills the sub-pixel flicker on settle.
const lift = (values: { y?: string | number }) =>
  `translateY(${values.y ?? 0}) translateZ(0)`;

const maskedStyle = {
  willChange: "transform",
  backfaceVisibility: "hidden" as const,
};

// Words roll through the mask: old exits up while new enters from below.
const wordVariants: Variants = {
  initial: { y: "115%" },
  animate: { y: "0%", transition: { duration: WORD_REVEAL, ease: [0.76, 0, 0.24, 1] } },
  exit: { y: "-115%", transition: { duration: WORD_REVEAL, ease: [0.76, 0, 0.24, 1] } },
};

// Full-name lines wipe up from a mask, staggered for a credits-roll feel.
const lineVariants: Variants = {
  initial: { y: "110%" },
  animate: (i: number) => ({
    y: "0%",
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.2 },
  }),
};

const curtainVariants: Variants = {
  initial: { y: 0 },
  exit: {
    y: "-100%",
    transition: { duration: 1.4, ease: [0.76, 0, 0.24, 1], delay: 0.1 },
  },
};

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"rotating" | "name">("rotating");
  const [done, setDone] = useState(false);
  const count = useCounter(ROTATE_TOTAL);

  // Phase 1 — cycle the rotating words, then hand off to the name reveal.
  useEffect(() => {
    if (phase !== "rotating") return;
    const last = index >= rotatingWords.length - 1;
    const id = setTimeout(
      () => (last ? setPhase("name") : setIndex((i) => i + 1)),
      ROTATE_INTERVAL
    );
    return () => clearTimeout(id);
  }, [index, phase]);

  // Phase 2 — hold the full name (with its scroll cue), then trigger the reveal.
  useEffect(() => {
    if (phase !== "name") return;
    const id = setTimeout(() => setDone(true), NAME_HOLD);
    return () => clearTimeout(id);
  }, [phase]);

  // Lock scroll only while the curtain is on screen. Tied to `done` (not just
  // mount) because <Preloader> stays mounted after the intro.
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
            <span>Est. Chennai</span>
            <span>Since 2013</span>
          </div>

          {/* Center — rotating words, then the full studio name */}
          <div className="flex flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              {phase === "rotating" ? (
                <motion.div
                  key="rotating"
                  exit={{ opacity: 0, transition: { duration: 0.4 } }}
                  className="relative h-[1.15em] w-full overflow-hidden font-serif text-[15vw] leading-none tracking-tightest md:text-[10vw]"
                >
                  {/* Overlapping roll — no `mode`, so the last word fully lands. */}
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={rotatingWords[index]}
                      variants={wordVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transformTemplate={lift}
                      style={maskedStyle}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {rotatingWords[index]}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.h1
                  key="name"
                  // Pin a moderate optical size + weight so Fraunces' thin `e`
                  // crossbar stays solid at display size (otherwise `e` → `c`).
                  style={{
                    fontVariationSettings:
                      "'wght' 440, 'opsz' 34, 'SOFT' 0, 'WONK' 0",
                  }}
                  className="text-center font-serif text-[8.5vw] leading-[1.08] tracking-tightest md:text-[5.2vw]"
                >
                  <span className="block overflow-hidden pb-[0.12em]">
                    <motion.span
                      className="block"
                      custom={0}
                      variants={lineVariants}
                      initial="initial"
                      animate="animate"
                      transformTemplate={lift}
                      style={maskedStyle}
                    >
                      Sree <span className="italic text-clay">Mahalakshmi</span>
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden pb-[0.12em]">
                    <motion.span
                      className="block"
                      custom={1}
                      variants={lineVariants}
                      initial="initial"
                      animate="animate"
                      transformTemplate={lift}
                      style={maskedStyle}
                    >
                      Interior Decorators
                    </motion.span>
                  </span>
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom — counter while rotating, scroll cue once the name lands */}
          <div className="flex min-h-[3.5rem] items-end justify-between">
            <AnimatePresence mode="wait">
              {phase === "rotating" ? (
                <motion.span
                  key="count"
                  exit={{ opacity: 0, transition: { duration: 0.4 } }}
                  className="font-serif text-6xl tracking-tightest md:text-8xl"
                >
                  {count}
                  <span className="align-top text-2xl text-clay md:text-3xl">
                    %
                  </span>
                </motion.span>
              ) : (
                <motion.div
                  key="cue"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.3em] text-bone/60"
                >
                  <span>Scroll to enter</span>
                  <motion.span
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowDown className="h-4 w-4 text-clay" />
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress line — only meaningful during the count. */}
            {phase === "rotating" && (
              <div className="mb-3 hidden w-1/2 md:block">
                <motion.div
                  className="h-px w-full origin-left bg-bone/30"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: count / 100 }}
                  transition={{ ease: "linear" }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
