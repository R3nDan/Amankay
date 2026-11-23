"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { CupSoda, Utensils, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { type Product } from "@/data/bakery";
import { TiltCard } from "@/components/ui/tilt-card";
import { ProductSymbol } from "@/components/ui/bakery-symbol-pattern";
import { useOrder } from "@/components/order-experience";
import { useI18n } from "@/lib/i18n";

export function ProductGrid({ items }: { items: readonly Product[] }) {
  return <ul className="product-grid">{items.map(product => <li key={product.id}><ProductCard product={product} /></li>)}</ul>;
}

function ProductCard({ product }: { product: Product }) {
  const order = useOrder();
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const rotation = useMotionValue(0);
  const lift = useTransform(rotation, [0, 90, 180], [1, 1.025, 1]);
  const depth = useTransform(rotation, [0, 90, 180], [0, 18, 0]);
  const pitch = useTransform(rotation, [0, 90, 180], [0, -2, 0]);
  const front = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const symbol = useRef<HTMLSpanElement>(null);
  const turn = (value: boolean) => {
    setFlipped(value);
    // Focus after React makes the destination face interactive.
    requestAnimationFrame(() => (value ? back : front).current?.focus({ preventScroll: true }));
  };
  useEffect(() => {
    const flip = animate(rotation, flipped ? 180 : 0, {
      duration: reducedMotion ? 0.01 : 1,
      ease: [0.45, 0, 0.55, 1],
    });
    return () => flip.stop();
  }, [flipped, reducedMotion, rotation]);
  return <TiltCard className="product-flip-card">
    <motion.div
      className="product-flip-rotor"
      style={{ rotateY: rotation, rotateX: pitch, scale: lift, z: depth }}
      onKeyDown={event => { if (event.key === "Escape" && flipped) turn(false); }}
    >
      <article className="product-face product-face-front" inert={flipped} aria-hidden={flipped}>
        <button ref={front} className="product-card-trigger" type="button" onClick={() => { setQuantity(1); turn(true); }} aria-label={`${t("Ver ")}${t(product.name)}${t(" y agregar a la bolsa")}`} aria-expanded={flipped}>
          {product.photo ? <div className="product-photo"><Image src={product.photo} alt={t(product.name)} fill sizes="(max-width: 600px) 45vw, (max-width: 900px) 43vw, (max-width: 1100px) 29vw, 24vw" /></div>
            : <div className="product-photo product-pending"><span aria-hidden>{product.category === "bebidas" ? <CupSoda /> : <Utensils />}</span><span>{t("Pronto, en imágenes.")}</span></div>}
          <div className="product-front-caption"><h3>{t(product.name)}</h3><span className="product-front-price">{formatPrice(product.price || 0)}</span></div>
        </button>
      </article>
      <article className="product-face product-face-back" aria-label={t(product.name)} inert={!flipped} aria-hidden={!flipped} onClick={event => { if (!(event.target as HTMLElement).closest("button, a, input, select, textarea, [role='button']")) turn(false); }}>
        <div className="product-back-content">
          <span ref={symbol} className="product-back-symbol" aria-hidden><ProductSymbol id={product.id} category={product.category} /></span>
          <h3>{t(product.name)}</h3>
          <p>{t(product.description ?? "")}</p>
          <div className="product-back-price">
            <span>{t("Precio unitario")} <b>{formatPrice(product.price || 0)}</b></span>
            <strong aria-live="polite"><small>{t("Total · ")}{quantity} {t(quantity === 1 ? "unidad" : "unidades")}</small>{formatPrice((product.price || 0) * quantity)}</strong>
          </div>
          <div className="product-back-actions">
            <div className="order-stepper" aria-label={`${t("Cantidad de ")}${product.name}`}>
              <button type="button" aria-label={t("Quitar uno")} onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus size={16} /></button>
              <output aria-live="polite">{quantity}</output>
              <button type="button" aria-label={t("Agregar uno")} onClick={() => setQuantity(value => Math.min(99, value + 1))}><Plus size={16} /></button>
            </div>
            <button ref={back} className="order-primary" type="button" onClick={() => { order.addProduct(product, quantity, symbol.current?.getBoundingClientRect()); turn(false); }}>{t("Agregar a la bolsa")}</button>
          </div>
        </div>
      </article>
    </motion.div>
  </TiltCard>;
}
