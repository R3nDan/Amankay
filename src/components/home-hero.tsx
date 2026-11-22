"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSiteReducedMotion } from "@/components/ui/motion-preference";
import { useEffect, useState } from "react";
import { ActionLink } from "@/components/ui/action-link";
import { BakerySymbolPattern } from "@/components/ui/bakery-symbol-pattern";

const frames = [
  { src: "/imagenes/portada/proceso/amasar.webp", alt: "Manos amasando la masa sobre una mesa enharinada" },
  { src: "/imagenes/portada/proceso/dar-forma.webp", alt: "Manos dando forma a una pieza de masa" },
  { src: "/imagenes/portada/proceso/hornear.webp", alt: "Panes dorados dentro del horno" },
  { src: "/imagenes/portada/proceso/listo.webp", alt: "Panes recién horneados listos para compartir" },
];

export function HomeHero() {
  const [activeFrame, setActiveFrame] = useState(0);
  const reduceMotion = useSiteReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setActiveFrame(current => (current + 1) % frames.length), 4200);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return <section className="hero-story" aria-label="Inicio">
    <div className="hero-sticky">
      <div className="hero">
        <BakerySymbolPattern />
        <div className="hero-paper-grain" aria-hidden />
        <div className="hero-copy">
          <h1 id="portada">Pan del día.<br /><em>Y algo más.</em></h1>
          <div className="hero-actions">
            <a className="process-button" href="#proceso">Ver el proceso <ArrowDown size={17} aria-hidden /></a>
            <ActionLink href="/menu">Ver el menú</ActionLink>
          </div>
        </div>
        <div className="hero-art">
          <figure className="hero-photo-mat">
            <div className="hero-photo-frame">
              <AnimatePresence initial={false} mode="wait">
                <motion.div key={frames[activeFrame].src} className="hero-photo-slide"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 34 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -34 }}
                  transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}>
                  <Image className="hero-photo" src={frames[activeFrame].src} alt={frames[activeFrame].alt} fill
                    priority={activeFrame === 0} sizes="(max-width: 760px) 88vw, 52vw" />
                </motion.div>
              </AnimatePresence>
            </div>
            <figcaption className="photo-caption" aria-hidden="true"><i /></figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>;
}
