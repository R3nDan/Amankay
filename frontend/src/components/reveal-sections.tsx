"use client";

import { useEffect } from "react";
import { useSiteReducedMotion } from "@/components/ui/motion-preference";

export function RevealSections() {
  const reduced = useSiteReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.animate(
          [{ transform: "translateY(14px)", opacity: 0.65 }, { transform: "none", opacity: 1 }],
          { duration: 500, easing: "cubic-bezier(.18,.75,.3,1)" }
        );
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    document.querySelectorAll(".branch-card, .category-index > a, .branch-call").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [reduced]);
  return null;
}
