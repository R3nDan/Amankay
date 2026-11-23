"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
import { products, type Product } from "@/data/bakery";
import { branches } from "@/data/branches";
import { api, type Branch as ApiBranch } from "@/lib/api";
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
  const [neighborhood, setNeighborhood] = useState("");
  const [reference, setReference] = useState("");
  const [payment, setPayment] = useState<"efectivo" | "transferencia">("efectivo");
  const [awaitingWhatsAppConfirmation, setAwaitingWhatsAppConfirmation] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [whatsAppOpenFailed, setWhatsAppOpenFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [orderError, setOrderError] = useState("");
  const fee = mode === "domicilio" ? 2000 : 0;
  const send = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rows.length || sending) return;
    const selectedBranch = branches.find(item => item.id === branch) ?? branches[0];
    const chat = window.open("about:blank", "_blank");
    if (!chat) {
      setWhatsAppOpenFailed(true);
      return;
    }
    chat.opener = null;
    setSending(true);
    setOrderError("");
    try {
      const [catalog, apiBranches] = await Promise.all([
        api<{ id: string; nombre: string; precio: number }[]>("/catalog/products"),
        api<ApiBranch[]>("/branches"),
      ]);
      const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("es");
      const productByName = new Map(catalog.map(item => [normalize(item.nombre), item]));
      const orderItems = rows.map(({ product, quantity }) => {
        const backendProduct = productByName.get(normalize(product.name));
        if (!backendProduct) throw new Error(`“${product.name}” no está disponible en el catálogo actual.`);
        return { productoId: backendProduct.id, cantidad: quantity, name: backendProduct.nombre, unitPrice: backendProduct.precio };
      });
      const backendBranch = mode === "recoger"
        ? apiBranches.find(item => normalize(item.nombre) === normalize(selectedBranch.name))
        : undefined;
      if (mode === "recoger" && !backendBranch) throw new Error("La sucursal seleccionada no está disponible. Actualiza la página e inténtalo de nuevo.");

      const savedOrder = await api<{ id: string; codigoSeguimiento: string; total: number; venceEn: string }>("/orders/web", {
        method: "POST",
        body: JSON.stringify({
          modalidad: mode === "recoger" ? "RECOGER" : "DOMICILIO",
          sucursalId: backendBranch?.id ?? null,
          nombre: name.trim(),
          telefono: phone.trim(),
          direccion: mode === "domicilio" ? address.trim() : null,
          barrio: mode === "domicilio" ? neighborhood.trim() : null,
          referencia: mode === "domicilio" ? reference.trim() || null : null,
          ubicacionConsentida: false,
          latitud: null,
          longitud: null,
          items: orderItems.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
        }),
      });
      const savedLines = orderItems.map(item => `• ${item.cantidad} × ${item.name} — ${formatPrice(item.unitPrice * item.cantidad)}`);
      const serverSubtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.cantidad, 0);
      const serverDeliveryFee = savedOrder.total - serverSubtotal;
      const deliveryDetails = mode === "domicilio"
        ? ["Modalidad: Domicilio en Neiva", `Dirección: ${address.trim()}`, `Barrio: ${neighborhood.trim()}`, `Referencia: ${reference.trim() || "Sin referencia"}`]
        : ["Modalidad: Recoger en sucursal", `Sucursal: ${backendBranch!.nombre}`, `Dirección: ${backendBranch!.direccion}`];
      const lines = [
        "*AMANKAY*", "SOLICITUD DE PEDIDO", "────────────────────",
        "Hola, quiero realizar el siguiente pedido:", "", "*PRODUCTOS*", ...savedLines, "",
        "*RESUMEN DEL PEDIDO*", `Subtotal: ${formatPrice(serverSubtotal)}`,
        mode === "domicilio" ? `Domicilio: ${formatPrice(serverDeliveryFee)}` : "Recogida: Sin costo adicional",
        `*TOTAL ESTIMADO: ${formatPrice(savedOrder.total)}*`,
        "Disponibilidad y valor final por confirmar al atender la solicitud.", "",
        "*ENTREGA*", ...deliveryDetails, "",
        "*DATOS DE CONTACTO*", `Nombre: ${name.trim()}`, `Teléfono: ${phone.trim()}`,
        `Pago preferido: ${payment === "efectivo" ? "Efectivo" : "Transferencia"}`, "",
        `Código de seguimiento: ${savedOrder.codigoSeguimiento}`,
        "────────────────────", "Por favor, confirma la disponibilidad y el valor final del pedido.",
      ];
      const whatsAppHref = `https://wa.me/573125864045?text=${encodeURIComponent(lines.join("\n"))}`;
      setWhatsAppOpenFailed(false);
      setWhatsAppUrl(whatsAppHref);
      setTrackingCode(savedOrder.codigoSeguimiento);
      setAwaitingWhatsAppConfirmation(true);
      chat.location.href = whatsAppHref;
    } catch (failure) {
      chat.close();
      setWhatsAppOpenFailed(false);
      setOrderError(failure instanceof Error ? failure.message : "No se pudo registrar el pedido. La bolsa sigue intacta.");
    } finally {
      setSending(false);
    }
  };
  return <div className="order-drawer-layer">
    <motion.button className="order-drawer-scrim" aria-label="Cerrar bolsa" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
    <motion.aside className="order-drawer" role="dialog" aria-modal="true" aria-labelledby="order-drawer-title" initial={{ x: "105%" }} animate={{ x: 0 }} exit={{ x: "105%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
      <div className="order-drawer-head"><div><h2 id="order-drawer-title">Tu bolsa</h2></div><button onClick={close} aria-label="Cerrar bolsa"><X size={22} /></button></div>
      {sent ? <div className="order-sent" aria-live="polite"><span className="order-sent-mark"><Check size={22} /></span><h3>Solicitud enviada</h3><p>La bolsa quedó libre. Amankay confirmará disponibilidad y valor final por WhatsApp.</p><Link className="order-primary" href="/menu" onClick={close}>Seguir explorando</Link></div>
        : rows.length && awaitingWhatsAppConfirmation ? <div className="order-whatsapp-pending"><PaperBreadBag /><h3>¿Ya enviaste tu solicitud?</h3><p>Pedido {trackingCode}. Envía el mensaje preparado en WhatsApp; al confirmar aquí que lo enviaste, liberaremos la bolsa.</p><a className="order-primary" href={whatsAppUrl} target="_blank" rel="noreferrer">Abrir WhatsApp de nuevo</a><button className="order-primary" type="button" onClick={() => { clearCart(); setAwaitingWhatsAppConfirmation(false); setSent(true); }}>Sí, ya lo envié</button></div>
        : rows.length ? <form onSubmit={send} className="order-drawer-body">
        <ul className="order-cart-list">{rows.map(({ product, quantity }) => <li key={product.id} className="order-cart-item"><div className="order-cart-photo">{product.photo && <Image src={product.photo} alt="" fill sizes="76px" />}</div><div><h3>{product.name}</h3><span>{formatPrice((product.price || 0) * quantity)}</span><div className="order-stepper"><button type="button" aria-label={`Quitar un ${product.name}`} onClick={() => update(product.id, quantity - 1)}><Minus size={15} /></button><output>{quantity}</output><button type="button" aria-label={`Agregar un ${product.name}`} onClick={() => update(product.id, quantity + 1)}><Plus size={15} /></button></div></div></li>)}</ul>
        <div className="order-totals"><p><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></p><p><span>Domicilio</span><strong>{formatPrice(fee)}</strong></p><p className="order-grand-total"><span>Total estimado</span><strong>{formatPrice(subtotal + fee)}</strong></p></div>
        <fieldset className="order-mode"><legend>¿Cómo quieres recibirlo?</legend><label><input type="radio" name="mode" checked={mode === "recoger"} onChange={() => setMode("recoger")} /> Recoger</label><label><input type="radio" name="mode" checked={mode === "domicilio"} onChange={() => setMode("domicilio")} /> Domicilio</label></fieldset>
        {mode === "recoger" ? <label className="order-field">Sucursal para recoger<select value={branch} onChange={event => setBranch(event.target.value)}>{branches.map(item => <option key={item.id} value={item.id}>{item.name} · {item.address}</option>)}</select></label> : <><label className="order-field">Barrio en Neiva<input value={neighborhood} onChange={event => setNeighborhood(event.target.value)} autoComplete="address-level3" required maxLength={120} /></label><p className="order-hint order-delivery-hint">Domicilios disponibles solo para Neiva, la tarifa es de 2.000 pesos adicionales, y la disponibilidad se confirma al atender su solicitud.</p></>}
        <fieldset className="order-mode"><legend>¿Cómo prefieres pagar?</legend><label><input type="radio" name="payment" checked={payment === "efectivo"} onChange={() => setPayment("efectivo")} /> Efectivo</label><label><input type="radio" name="payment" checked={payment === "transferencia"} onChange={() => setPayment("transferencia")} /> Transferencia</label></fieldset>
        <div className="order-fields"><label className="order-field">Nombre<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required maxLength={80} /></label><label className="order-field">Teléfono<input value={phone} onChange={event => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" pattern="[0-9+() .-]{7,20}" required /></label>{mode === "domicilio" && <><label className="order-field">Dirección en Neiva<input value={address} onChange={event => setAddress(event.target.value)} autoComplete="street-address" required maxLength={160} /></label><label className="order-field">Referencia para la entrega<input value={reference} onChange={event => setReference(event.target.value)} maxLength={160} /></label></>}</div>
        <p className="order-hint">Al continuar se abrirá WhatsApp con tu solicitud. Amankay confirmará precio final y disponibilidad antes de aceptar el pedido.</p>
        {orderError && <p className="order-whatsapp-error" role="alert">{orderError}</p>}
        {whatsAppOpenFailed && <p className="order-whatsapp-error" role="alert">Permite las ventanas emergentes para continuar a WhatsApp; tu pedido no se registró y la bolsa sigue intacta.</p>}
        <button className="order-primary order-submit" type="submit" disabled={sending} aria-label="Enviar solicitud por WhatsApp" title="Enviar solicitud por WhatsApp">{sending ? "Registrando pedido…" : <PaperBreadBag />}</button>
      </form> : <div className="order-empty"><PaperBreadBag /><p>Tu bolsa espera algo rico.</p><Link className="order-primary" href="/menu" onClick={close}>Explorar el catálogo</Link></div>}
    </motion.aside>
  </div>;
}
