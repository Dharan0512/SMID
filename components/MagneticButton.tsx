"use client";

import { useRef, ReactNode, MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  /** How far the shell is pulled toward the cursor. Lower = subtler. */
  strength?: number;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  as?: "button" | "a";
  href?: string;
};

/**
 * A button that "magnetically" follows the cursor while hovered, then springs
 * back to rest on leave. The label is translated at half the shell's strength
 * to create an inner-parallax, weighted feel.
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 0.4,
  onClick,
  as = "button",
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Label drifts at half the shell's displacement for a layered parallax.
  const labelX = useTransform(xSpring, (v) => v * 0.5);
  const labelY = useTransform(ySpring, (v) => v * 0.5);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Tag = as === "a" ? motion.a : motion.button;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      className="inline-block"
    >
      <Tag
        href={href}
        onClick={onClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={className}
      >
        <motion.span className="block" style={{ x: labelX, y: labelY }}>
          {children}
        </motion.span>
      </Tag>
    </motion.div>
  );
}
