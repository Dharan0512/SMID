"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

/**
 * Kinetic smooth scrolling powered purely by Framer Motion (no Lenis/GSAP).
 *
 * Strategy: the real document is given the measured height of the content so
 * the native scrollbar still works. The content itself is fixed-positioned and
 * translated upward by the spring-smoothed scroll position, which gives the
 * heavy, inertial glide you see on luxury agency sites.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Keep the spacer in sync with the content's real height (handles resize,
  // font loading, and image reflow via ResizeObserver).
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => setContentHeight(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const { scrollY } = useScroll();

  // The spring is the soul of the effect — high damping + low stiffness yields
  // a weighted, premium deceleration.
  const smoothY = useSpring(scrollY, {
    damping: 28,
    stiffness: 140,
    mass: 0.6,
  });

  const y = useTransform(smoothY, (value) => -value);

  // Expose the smoothed scroll position so child sections (parallax, etc.) can
  // subscribe to it via a CSS variable without prop-drilling.
  useMotionValueEvent(smoothY, "change", (latest) => {
    document.documentElement.style.setProperty("--smooth-scroll", `${latest}`);
  });

  return (
    <>
      <motion.div
        ref={contentRef}
        style={{ y }}
        className="fixed left-0 top-0 w-full will-change-transform"
      >
        {children}
      </motion.div>
      {/* Spacer that restores natural document height for the scrollbar. */}
      <div style={{ height: contentHeight }} aria-hidden />
    </>
  );
}
