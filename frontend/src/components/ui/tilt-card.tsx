"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useSiteReducedMotion } from "@/components/ui/motion-preference";

export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const bounds = useRef<DOMRect | null>(null);
  const reduced = useSiteReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lightX = useMotionValue(50);
  const lightY = useMotionValue(50);
  const rotateX = useSpring(x, { stiffness: 210, damping: 24 });
  const rotateY = useSpring(y, { stiffness: 210, damping: 24 });
  const light = useMotionTemplate`radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,245,218,.24), transparent 65%)`;
  function move(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse" || !bounds.current) return;
    const rect = bounds.current;
    const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    x.set((0.5 - py) * 12);
    y.set((px - 0.5) * 14);
    lightX.set(px * 100);
    lightY.set(py * 100);
  }
  function reset() { x.set(0); y.set(0); bounds.current = null; }
  return <div className={`tilt-card ${className}`}
    onPointerEnter={event => { bounds.current = event.currentTarget.getBoundingClientRect(); }}
    onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
    <motion.div className="tilt-card-surface" style={{ rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY }}>
      {children}
      <motion.span className="tilt-card-light" aria-hidden style={{ background: light }} />
    </motion.div>
  </div>;
}
