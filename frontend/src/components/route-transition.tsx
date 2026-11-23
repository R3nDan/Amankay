"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useSiteReducedMotion } from "@/components/ui/motion-preference";
import { categories } from "@/data/bakery";

const routes = ["/", ...categories.map(category => `/menu/${category.slug}`)];

// Lives in the root layout: route templates would reset the departure index.
export function RouteTransition({ children, panels }: { children: ReactNode; panels: ReactNode[] }) {
  const pathname = usePathname();
  const reduced = useSiteReducedMotion();
  const departureScroll = useRef(0);
  const [journey, setJourney] = useState({ pathname, from: routes.indexOf(pathname), to: routes.indexOf(pathname), running: false });
  const [verticalReturn, setVerticalReturn] = useState<number | null>(null);
  if (journey.pathname !== pathname) {
    const to = routes.indexOf(pathname);
    setJourney({ pathname, from: journey.to, to, running: journey.to >= 0 && to >= 0 && journey.to !== to });
  }

  useLayoutEffect(() => {
    const header = document.querySelector(".masthead");
    if (!header) return;
    const measure = () => document.documentElement.style.setProperty("--masthead-stack", `${header.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const captureDeparture = () => { departureScroll.current = window.scrollY; };
    document.addEventListener("click", captureDeparture, true);
    window.addEventListener("popstate", captureDeparture);
    return () => {
      document.removeEventListener("click", captureDeparture, true);
      window.removeEventListener("popstate", captureDeparture);
    };
  }, []);

  useEffect(() => {
    const returnHome = () => {
      const from = window.scrollY;
      if (from < 2) return;
      setVerticalReturn(from);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("amankay:return-home", returnHome);
    return () => window.removeEventListener("amankay:return-home", returnHome);
  }, []);

  const active = journey.pathname === pathname && journey.running;
  useLayoutEffect(() => {
    // Real pages and transition panels share the document animation clock.
    // Newly mounted patterns continue at the same phase instead of restarting.
    document.querySelectorAll(".hero-symbol-track").forEach(track => {
      track.getAnimations().forEach(animation => { animation.startTime = 0; });
    });
  }, [pathname, active, verticalReturn]);
  useLayoutEffect(() => {
    if (active) {
      if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [active, pathname]);

  const first = Math.min(journey.from, journey.to);
  const last = Math.max(journey.from, journey.to);
  const finish = () => setJourney(current => current.pathname === pathname ? { ...current, running: false } : current);

  return <>
    <div className="route-content" inert={active || undefined}>{children}</div>
    {active && <div key={pathname} className="page-deck" aria-hidden="true" inert data-deck-preview>
      <motion.div className="page-deck-rail"
        initial={reduced ? { opacity: 1 } : { x: `${-(journey.from - first) * 100}%` }}
        animate={reduced ? { opacity: 0 } : { x: `${-(journey.to - first) * 100}%` }}
        transition={{ duration: reduced ? 0.15 : 0.65 + (last - first - 1) * 0.25, ease: [0.65, 0, 0.25, 1] }}
        onAnimationComplete={finish}>
        {panels.slice(first, last + 1).map((panel, index) => <div className="page-deck-card" key={routes[first + index]} style={{ left: `${index * 100}%` }}>
          <DeckPanel departure={first + index === journey.from} scroll={departureScroll}>{panel}</DeckPanel>
        </div>)}
      </motion.div>
    </div>}
    {verticalReturn !== null && pathname === "/" && <div className="page-deck page-deck-vertical" aria-hidden="true" inert data-deck-preview>
      <motion.div className="page-deck-vertical-panel"
        initial={{ y: -verticalReturn }} animate={{ y: 0 }}
        transition={{ duration: reduced ? 0.15 : Math.min(1.25, 0.65 + verticalReturn / 3800), ease: [0.65, 0, 0.25, 1] }}
        onAnimationComplete={() => setVerticalReturn(null)}>{panels[0]}</motion.div>
    </div>}
  </>;
}

function DeckPanel({ departure, scroll, children }: { departure: boolean; scroll: { current: number }; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current && departure) ref.current.style.transform = `translateY(-${scroll.current}px)`;
  }, [departure, scroll]);
  return <div ref={ref}>{children}</div>;
}
