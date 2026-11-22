"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useSiteReducedMotion } from "@/components/ui/motion-preference";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { categories } from "@/data/bakery";

export function CategoryNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const reduceMotion = useSiteReducedMotion();
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });
  const links = [{ name: "Inicio", href: "/" }, ...categories.map(category => ({
    name: category.name, href: `/menu/${category.slug}`,
  }))];

  useLayoutEffect(() => {
    const nav = navRef.current;
    const activeLink = linkRefs.current.get(pathname);
    if (!nav || !activeLink) return;
    const positionIndicator = () => {
      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setIndicator({ x: linkRect.left - navRect.left + nav.scrollLeft, width: linkRect.width });
    };
    positionIndicator();
    const observer = new ResizeObserver(positionIndicator);
    observer.observe(nav);
    window.addEventListener("resize", positionIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", positionIndicator);
    };
  }, [pathname]);

  return <nav ref={navRef} className="category-nav" aria-label="Navegación principal">
    {links.map(link => {
      const active = pathname === link.href;
      return <Link ref={node => { if (node) linkRefs.current.set(link.href, node); }} key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
        <motion.span whileHover={{ scale: 1.035, backgroundColor: "#FAF0DD" }}
          whileTap={{ scale: 0.94, backgroundColor: "#FAF0DD" }}
          transition={{ type: "spring", stiffness: 470, damping: 23, backgroundColor: { duration: 0 } }}>{link.name}</motion.span>
      </Link>;
    })}
    <motion.span className="category-indicator" aria-hidden
      animate={{ left: indicator.x, width: indicator.width }}
      transition={reduceMotion
        ? { type: "tween", duration: 0.24, ease: "easeOut" }
        : { type: "spring", stiffness: 400, damping: 34, mass: 0.8 }} />
  </nav>;
}
