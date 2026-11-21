"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/data/bakery";

export function CategoryNav() {
  const pathname = usePathname();
  const links = [{ name: "Inicio", href: "/" }, ...categories.map(category => ({
    name: category.name, href: `/menu/${category.slug}`,
  }))];
  return <nav className="category-nav" aria-label="Navegación principal">
    {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}
      onClick={event => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        event.currentTarget.animate([
          { transform: "translateY(0) scale(1)", filter: "brightness(1)" },
          { transform: "translateY(1px) scale(.96)", filter: "brightness(.9)", offset: .42 },
          { transform: "translateY(0) scale(1)", filter: "brightness(1)" },
        ], { duration: 320, easing: "cubic-bezier(.2,.75,.25,1)" });
      }}>
      {link.name}
    </Link>)}
  </nav>;
}
