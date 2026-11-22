"use client";

import Link from "next/link";
import { ContactBookIcon } from "@/components/ui/contact-book-icon";
import { motion } from "motion/react";
import { useSiteReducedMotion } from "@/components/ui/motion-preference";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { categories } from "@/data/bakery";
import { useOrder } from "@/components/order-experience";
import { PaperBreadBag } from "@/components/ui/paper-bread-bag";

export function CategoryNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const reduceMotion = useSiteReducedMotion();
  const order = useOrder();
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });
  const links = [{ name: "Inicio", href: "/#inicio", route: "/" }, ...categories.map(category => ({
    name: category.name, href: `/menu/${category.slug}`, route: `/menu/${category.slug}`,
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
    <Link className="category-nav-tool category-nav-contact" href="/#contacto" aria-label="Contáctanos">
      <ContactBookIcon />
    </Link>
    <div className="category-nav-links">
    {links.map(link => {
      const active = pathname === link.route;
      return <Link ref={node => { if (node) linkRefs.current.set(link.route, node); }} key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
        <motion.span whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 470, damping: 23 }}>{link.name}</motion.span>
      </Link>;
    })}
    </div>
    <button type="button" className="category-nav-tool category-nav-order" onClick={order.openDrawer} aria-label={`Pide: abrir la bolsa${order.count ? `, ${order.count} productos` : ""}`} aria-expanded={order.drawerOpen}>
      <span className="order-bag-icon"><PaperBreadBag open={order.receiving} />{order.count > 0 && <span className="order-bag-dot" aria-hidden="true" />}</span>
    </button>
    <motion.span className="category-indicator" aria-hidden
      animate={{ left: indicator.x, width: indicator.width }}
      transition={reduceMotion
        ? { type: "tween", duration: 0.24, ease: "easeOut" }
        : { type: "spring", stiffness: 400, damping: 34, mass: 0.8 }} />
  </nav>;
}
