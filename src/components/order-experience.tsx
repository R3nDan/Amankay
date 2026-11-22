"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
import { products, type Product } from "@/data/bakery";
import { branches } from "@/data/branches";
import { formatPrice } from "@/lib/currency";
import { ProductSymbol } from "@/components/ui/bakery-symbol-pattern";
import { PaperBreadBag } from "@/components/ui/paper-bread-bag";
import { useSiteReducedMotion } from "@/components/ui/motion-preference";

type Cart = Record<string, number>;
type Flight = { id: number; product: Product; x: number; y: number; dx: number; dy: number };
type OrderContextValue = {
  count: number;
  drawerOpen: boolean;
  receiving: boolean;
  addProduct: (product: Product, quantity: number, source?: DOMRect) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};
const OrderContext = createContext<OrderContextValue | null>(null);

export function useOrder() {
  const value = useContext(OrderContext);
  if (!value) throw new Error("OrderProvider is missing");
  return value;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [receiving, setReceiving] = useState(false);
  const reduced = useSiteReducedMotion();
  const opener = useRef<HTMLElement | null>(null);
  const receiveTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => receiveTimers.current.forEach(clearTimeout), []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("amankay-cart") || "{}") as Cart;
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        const restored = Object.fromEntries(Object.entries(saved).filter(([id, amount]) => products.some(p => p.id === id) && Number.isInteger(amount) && amount > 0 && amount <= 99));
        queueMicrotask(() => setCart(restored));
      }
    } catch { /* A malformed saved cart starts empty. */ }
  }, []);
  useEffect(() => { localStorage.setItem("amankay-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLElement>(".order-drawer");
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setDrawerOpen(false); opener.current?.focus(); }
      if (event.key === "Tab" && dialog) {
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled)"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (first && last && event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (first && last && !event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", escape); };
  }, [drawerOpen]);

  const openDrawer = useCallback(() => { opener.current = document.activeElement as HTMLElement; setDrawerOpen(true); }, []);
  const closeDrawer = useCallback(() => { setDrawerOpen(false); opener.current?.focus(); }, []);
  const clearCart = useCallback(() => setCart({}), []);
  const addProduct = (product: Product, quantity: number, source?: DOMRect) => {
    setCart(current => ({ ...current, [product.id]: Math.min(99, (current[product.id] || 0) + quantity) }));
    const target = document.querySelector(".category-nav-order .order-bag-icon")?.getBoundingClientRect();
    receiveTimers.current.forEach(clearTimeout);
    receiveTimers.current = [];
    setReceiving(false);
    if (!reduced && source && target) {
      const startX = source.left + source.width / 2;
      const startY = source.top + source.height / 2;
      setFlight({ id: Date.now(), product, x: startX - 26, y: startY - 26,
        dx: target.left + target.width / 2 - startX,
        dy: target.top - 17 - startY });
      receiveTimers.current.push(setTimeout(() => setReceiving(true), 2060));
      receiveTimers.current.push(setTimeout(() => setReceiving(false), 2780));
    } else {
      setReceiving(true);
      receiveTimers.current.push(setTimeout(() => setReceiving(false), 450));
    }
  };
  const count = Object.values(cart).reduce((sum, amount) => sum + amount, 0);
  const rows = useMemo(() => products.filter(product => cart[product.id]).map(product => ({ product, quantity: cart[product.id] })), [cart]);
  const subtotal = rows.reduce((sum, row) => sum + (row.product.price || 0) * row.quantity, 0);

  return <OrderContext.Provider value={{ count, drawerOpen, receiving, addProduct, openDrawer, closeDrawer }}>
    {children}
    <AnimatePresence>{flight && <motion.div key={flight.id} className="order-flying-symbol" aria-hidden="true" style={{ left: flight.x, top: flight.y }} initial={{ x: 0, y: 0, scale: .7, rotate: -12, opacity: 1 }} animate={{ x: [0, flight.dx * .08, flight.dx * .76, flight.dx, flight.dx, flight.dx], y: [0, -24, flight.dy - 20, flight.dy, flight.dy, flight.dy + 27], scale: [.7, .88, .48, .3, .3, .06], rotate: [-12, -22, 14, 0, 0, 9], opacity: [1, 1, 1, 1, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 2.7, times: [0, .1, .32, .45, .82, 1], ease: "easeInOut" }} onAnimationComplete={() => setFlight(null)}><ProductSymbol id={flight.product.id} category={flight.product.category} /></motion.div>}</AnimatePresence>
    <AnimatePresence>{drawerOpen && <OrderDrawer rows={rows} subtotal={subtotal} update={(id, amount) => setCart(current => { const next = { ...current }; if (amount <= 0) delete next[id]; else next[id] = Math.min(99, amount); return next; })} clearCart={clearCart} close={closeDrawer} />}</AnimatePresence>
  </OrderContext.Provider>;
}

function OrderDrawer({ rows, subtotal, update, clearCart, close }: { rows: { product: Product; quantity: number }[]; subtotal: number; update: (id: string, amount: number) => void; clearCart: () => void; close: () => void }) {
  const [mode, setMode] = useState<"recoger" | "domicilio">("recoger");
  const [branch, setBranch] = useState(branches[0].id);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [payment, setPayment] = useState<"efectivo" | "transferencia">("efectivo");
  const [awaitingWhatsAppConfirmation, setAwaitingWhatsAppConfirmation] = useState(false);
  const [whatsAppOpenFailed, setWhatsAppOpenFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const fee = mode === "domicilio" ? 2000 : 0;
  const send = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rows.length) return;
    const selectedBranch = branches.find(item => item.id === branch) ?? branches[0];
    const deliveryDetails = mode === "domicilio"
      ? ["Modalidad: Domicilio en Neiva", `Dirección: ${address.trim()}`, `Referencia: ${reference.trim() || "Sin referencia"}`]
      : ["Modalidad: Recoger en sucursal", `Sucursal: ${selectedBranch.name}`, `Dirección: ${selectedBranch.address}`];
    const lines = [
      "*AMANKAY*",
      "SOLICITUD DE PEDIDO",
      "────────────────────",
      "Hola, quiero realizar el siguiente pedido:",
      "",
      "*PRODUCTOS*",
      ...rows.map(({ product, quantity }) => `• ${quantity} × ${product.name}  —  ${formatPrice((product.price || 0) * quantity)}`),
      "",
      "*RESUMEN DEL PEDIDO*",
      `Subtotal: ${formatPrice(subtotal)}`,
      mode === "domicilio" ? `Domicilio: ${formatPrice(fee)}` : "Recogida: Sin costo adicional",
      `*TOTAL ESTIMADO: ${formatPrice(subtotal + fee)}*`,
      "",
      "*ENTREGA*",
      ...deliveryDetails,
      "Disponibilidad: Por confirmar al atender la solicitud.",
      "",
      "*DATOS DE CONTACTO*",
      `Nombre: ${name.trim()}`,
      `Teléfono: ${phone.trim()}`,
      `Pago preferido: ${payment === "efectivo" ? "Efectivo" : "Transferencia"}`,
      "",
      "────────────────────",
      "Por favor, confirma la disponibilidad y el valor final del pedido.",
    ];
    const chat = window.open("about:blank", "_blank");
    if (!chat) {
      setWhatsAppOpenFailed(true);
      return;
    }
    chat.opener = null;
    chat.location.href = `https://wa.me/573125864045?text=${encodeURIComponent(lines.join("\n"))}`;
    setWhatsAppOpenFailed(false);
    setAwaitingWhatsAppConfirmation(true);
  };
  return <div className="order-drawer-layer">
    <motion.button className="order-drawer-scrim" aria-label="Cerrar bolsa" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
    <motion.aside className="order-drawer" role="dialog" aria-modal="true" aria-labelledby="order-drawer-title" initial={{ x: "105%" }} animate={{ x: 0 }} exit={{ x: "105%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
      <div className="order-drawer-head"><div><h2 id="order-drawer-title">Tu bolsa</h2></div><button onClick={close} aria-label="Cerrar bolsa"><X size={22} /></button></div>
      {sent ? <div className="order-sent" aria-live="polite"><span className="order-sent-mark"><Check size={22} /></span><h3>Solicitud enviada</h3><p>La bolsa quedó libre. Amankay confirmará disponibilidad y valor final por WhatsApp.</p><Link className="order-primary" href="/menu" onClick={close}>Seguir explorando</Link></div>
        : rows.length && awaitingWhatsAppConfirmation ? <div className="order-whatsapp-pending"><PaperBreadBag /><h3>¿Ya enviaste tu solicitud?</h3><p>Envía el mensaje preparado en WhatsApp. Al confirmar aquí que lo enviaste, liberaremos la bolsa.</p><button className="order-primary" type="button" onClick={() => { clearCart(); setAwaitingWhatsAppConfirmation(false); setSent(true); }}>Sí, ya lo envié</button><button className="order-whatsapp-return" type="button" onClick={() => setAwaitingWhatsAppConfirmation(false)}>Volver a revisar la bolsa</button></div>
        : rows.length ? <form onSubmit={send} className="order-drawer-body">
        <ul className="order-cart-list">{rows.map(({ product, quantity }) => <li key={product.id} className="order-cart-item"><div className="order-cart-photo">{product.photo && <Image src={product.photo} alt="" fill sizes="76px" />}</div><div><h3>{product.name}</h3><span>{formatPrice((product.price || 0) * quantity)}</span><div className="order-stepper"><button type="button" aria-label={`Quitar un ${product.name}`} onClick={() => update(product.id, quantity - 1)}><Minus size={15} /></button><output>{quantity}</output><button type="button" aria-label={`Agregar un ${product.name}`} onClick={() => update(product.id, quantity + 1)}><Plus size={15} /></button></div></div></li>)}</ul>
        <div className="order-totals"><p><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p><p><span>Domicilio</span><strong>{formatPrice(fee)}</strong></p><p className="order-grand-total"><span>Total estimado</span><strong>{formatPrice(subtotal + fee)}</strong></p></div>
        <fieldset className="order-mode"><legend>¿Cómo quieres recibirlo?</legend><label><input type="radio" name="mode" checked={mode === "recoger"} onChange={() => setMode("recoger")} /> Recoger</label><label><input type="radio" name="mode" checked={mode === "domicilio"} onChange={() => setMode("domicilio")} /> Domicilio</label></fieldset>
        {mode === "recoger" ? <label className="order-field">Sucursal para recoger<select value={branch} onChange={event => setBranch(event.target.value)}>{branches.map(item => <option key={item.id} value={item.id}>{item.name} · {item.address}</option>)}</select></label> : <p className="order-hint order-delivery-hint">Domicilios disponibles solo para Neiva, la tarifa es de 2.000 pesos adicionales, y la disponibilidad se confirma al atender su solicitud.</p>}
        <fieldset className="order-mode"><legend>¿Cómo prefieres pagar?</legend><label><input type="radio" name="payment" checked={payment === "efectivo"} onChange={() => setPayment("efectivo")} /> Efectivo</label><label><input type="radio" name="payment" checked={payment === "transferencia"} onChange={() => setPayment("transferencia")} /> Transferencia</label></fieldset>
        <div className="order-fields"><label className="order-field">Nombre<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required maxLength={80} /></label><label className="order-field">Teléfono<input value={phone} onChange={event => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" pattern="[0-9+() .-]{7,20}" required /></label>{mode === "domicilio" && <><label className="order-field">Dirección en Neiva<input value={address} onChange={event => setAddress(event.target.value)} autoComplete="street-address" required maxLength={160} /></label><label className="order-field">Referencia para la entrega<input value={reference} onChange={event => setReference(event.target.value)} maxLength={160} /></label></>}</div>
        <p className="order-hint">Al continuar se abrirá WhatsApp con tu solicitud. Amankay confirmará precio final y disponibilidad antes de aceptar el pedido.</p>
        {whatsAppOpenFailed && <p className="order-whatsapp-error" role="alert">No se pudo abrir WhatsApp. Permite las ventanas emergentes e inténtalo de nuevo; tu bolsa sigue intacta.</p>}
        <button className="order-primary order-submit" type="submit" aria-label="Enviar solicitud por WhatsApp" title="Enviar solicitud por WhatsApp"><PaperBreadBag /></button>
      </form> : <div className="order-empty"><PaperBreadBag /><p>Tu bolsa espera algo rico.</p><Link className="order-primary" href="/menu" onClick={close}>Explorar el catálogo</Link></div>}
    </motion.aside>
  </div>;
}
