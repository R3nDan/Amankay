"use client";

import { useEffect, type RefObject } from "react";
import { useSiteReducedMotion } from "@/components/ui/motion-preference";

// Align only after approaching this panel and releasing the scroll gesture.
// Once aligned, allow leaving freely; rearm only after moving away.
export function useProcessFrame(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const reduced = useSiteReducedMotion();
  useEffect(() => {
    const section = ref.current;
    if (!section || !enabled) return;
    let timer = 0;
    let frame = 0;
    let settled = false;
    let touching = false;
    let approaching = false;
    const headerHeight = () => document.querySelector(".masthead")?.getBoundingClientRect().height ?? 0;
    const distance = () => section.getBoundingClientRect().top - headerHeight();
    let previous = distance();
    const radius = () => Math.min(220, Math.max(150, (window.innerHeight - headerHeight()) * 0.42));
    const stopForUserInput = () => {
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      // A new gesture interrupts the snap but should allow a fresh one after
      // the next scroll settles. Marking it as settled here made wheel input
      // permanently suppress the alignment on some browsers.
      settled = false;
    };
    const align = () => {
      if (touching || settled || !approaching || document.querySelector(".page-deck")) return;
      const delta = distance();
      if (Math.abs(delta) > radius() || Math.abs(delta) < 2) return;
      settled = true;
      const start = window.scrollY;
      const target = Math.max(0, start + delta);
      if (reduced) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }
      const began = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - began) / 310);
        window.scrollTo({ top: start + (target - start) * (1 - Math.pow(1 - progress, 3)), behavior: "instant" });
        if (progress < 1) frame = requestAnimationFrame(tick);
        else frame = 0;
      };
      frame = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const current = distance();
      if (!frame) {
        if (Math.abs(current) > radius() * 1.7) settled = false;
        approaching = Math.abs(current) < Math.abs(previous) || (current * previous < 0);
        window.clearTimeout(timer);
        if (approaching) timer = window.setTimeout(align, 160);
      }
      previous = current;
    };
    const onTouchStart = () => { touching = true; stopForUserInput(); };
    const onTouchEnd = () => { touching = false; timer = window.setTimeout(align, 160); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) return;
      if (event.target instanceof HTMLElement && event.target.matches("input, textarea, select, button, a, [contenteditable='true']")) return;
      stopForUserInput();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", stopForUserInput, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", stopForUserInput);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, enabled, reduced]);
}
