"use client";

import { useEffect } from "react";

export function RevealSections() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    document.querySelectorAll(".selection article, .process-inner, .branch-call").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
