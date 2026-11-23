"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Minus, Plus, RefreshCw, ShoppingBag } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { PaperBreadBag } from "@/components/ui/paper-bread-bag";
import { BakerySymbolPattern } from "@/components/ui/bakery-symbol-pattern";
import { HeaderCornerFrame } from "@/components/ui/header-corner-frame";
import "./table.css";

type Category = { id: string; nombre: string };
type Product = { id: string; categoriaId: string; nombre: string; descripcion: string; imagen: string; precio: number };
type Session = { sesionId: string; mesa: string; codigoQrMesa: string; estadoSesion: string; estadoCuenta: string; expiraEn: string; pedidos: { id: string; codigoSeguimiento: string; estado: string; total: number }[] };
type Created = { id: string; codigoSeguimiento: string; estado: string; total: number };
const money = (amount: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);
const orderStatusLabel = (status: string) => ({
  PENDIENTE_CONFIRMACION: "Pendiente de confirmación",
  ACEPTADO: "Aceptado",
  EN_PREPARACION: "En preparación",
  LISTO: "Listo",
  COMPLETADO: "Completado",
  RECHAZADO: "Rechazado",
  CANCELACION_SOLICITADA: "Cancelación solicitada",
  CANCELADO: "Cancelado",
  VENCIDO: "Vencido",
} as Record<string, string>)[status] ?? status.replaceAll("_", " ").toLocaleLowerCase("es-CO");
const invalidAccess = (failure: unknown) => failure instanceof ApiError && [404, 409].includes(failure.status)
  || failure instanceof Error && failure.message === "Este acceso temporal corresponde a otra mesa.";

export default function TablePage() {
  const { codigoMesa } = useParams<{ codigoMesa: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const fromHash = location.hash.startsWith("#t=") ? location.hash.slice(3) : null;
    if (fromHash) {
      sessionStorage.setItem(`amankay:mesa:${codigoMesa}`, fromHash);
      history.replaceState(null, "", location.pathname);
    }
    const current = fromHash ?? sessionStorage.getItem(`amankay:mesa:${codigoMesa}`);
    queueMicrotask(() => { setToken(current); if (!current) setLoading(false); });
  }, [codigoMesa]);

  const validate = useCallback(async (credential: string) => {
    const result = await api<Session>("/tables/sessions/validate", { method: "POST", body: JSON.stringify({ token: credential }) });
    if (result.codigoQrMesa !== codigoMesa) throw new Error("Este acceso temporal corresponde a otra mesa.");
    return result;
  }, [codigoMesa]);

  useEffect(() => {
    if (!token) return;
    let live = true;
    Promise.all([api<Category[]>("/catalog/categories"), api<Product[]>("/catalog/products"), validate(token)])
      .then(([groups, items, state]) => { if (live) { setCategories(groups); setProducts(items); setSession(state); setError(""); } })
      .catch(failure => { if (live) { setError(failure instanceof Error ? failure.message : "No se pudo comprobar la mesa."); if (invalidAccess(failure)) { setToken(null); sessionStorage.removeItem(`amankay:mesa:${codigoMesa}`); } } })
      .finally(() => { if (live) setLoading(false); });
    const timer = setInterval(() => { validate(token).then(state => { if (live) { setSession(state); setError(""); } }).catch(failure => { if (live) { setError(failure instanceof Error ? failure.message : "No se pudo actualizar la mesa."); if (invalidAccess(failure)) { setSession(null); setToken(null); sessionStorage.removeItem(`amankay:mesa:${codigoMesa}`); } } }); }, 15000);
    return () => { live = false; clearInterval(timer); };
  }, [token, validate, codigoMesa]);

  const chosen = useMemo(() => products.filter(item => cart[item.id] > 0), [products, cart]);
  const total = chosen.reduce((sum, item) => sum + item.precio * cart[item.id], 0);
  const visible = categoryId ? products.filter(item => item.categoriaId === categoryId) : products;
  const change = (id: string, difference: number) => setCart(current => ({ ...current, [id]: Math.max(0, Math.min(100, (current[id] ?? 0) + difference)) }));

  const send = async () => {
    if (!token || chosen.length === 0) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api<Created>("/tables/orders", { method: "POST", body: JSON.stringify({ token, items: chosen.map(item => ({ productoId: item.id, cantidad: cart[item.id] })) }) });
      setCart({}); setShowCart(false); setNotice("Pedido enviado. El equipo confirmará su preparación.");
      setSession(await validate(token));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo enviar el pedido."); }
    finally { setBusy(false); }
  };

  return <main id="contenido" className="table-page">
    <header className="table-header" aria-label="Amankay">
      <div className="table-header-ornament table-header-ornament-left"><HeaderCornerFrame side="left" /></div>
      <Image src="/imagenes/marca/amankay.svg" alt="Amankay" width={88} height={96} />
      <div className="table-header-ornament table-header-ornament-right"><HeaderCornerFrame side="right" /></div>
    </header>
    {loading ? <div className="table-state" aria-live="polite"><RefreshCw className="table-spin" aria-hidden="true" /> Preparando tu mesa…</div>
      : !token || error && !session ? <div className="table-state"><h1>Tu mesa te espera.</h1><p>{error || "Pide al personal que abra la sesión y te muestre el QR temporal de acceso."}</p></div>
      : <>
        <section className="table-intro" aria-hidden="true"><BakerySymbolPattern /></section>
        {error && <p className="table-alert" role="alert">{error}</p>}{notice && <p className="table-alert" role="status">{notice}</p>}
        <nav className="table-categories" aria-label="Categorías"><button aria-pressed={!categoryId} onClick={() => setCategoryId("")}>Todos</button>{categories.map(group => <button aria-pressed={categoryId === group.id} onClick={() => setCategoryId(group.id)} key={group.id}>{group.nombre}</button>)}</nav>
        <div className="table-grid">{visible.map(item => <article className="table-product" key={item.id}><div className="table-photo"><Image src={item.imagen} alt={item.nombre} fill sizes="(max-width: 700px) 50vw, 250px" /></div><div className="table-product-info"><h2>{item.nombre}</h2><strong>{money(item.precio)}</strong><p>{item.descripcion}</p><div className="table-quantity"><button onClick={() => change(item.id, -1)} disabled={!cart[item.id]} aria-label={`Quitar un ${item.nombre}`}><Minus size={18} /></button><span>{cart[item.id] ?? 0}</span><button onClick={() => change(item.id, 1)} aria-label={`Agregar un ${item.nombre}`}><Plus size={18} /></button></div></div></article>)}</div>
        <div className="table-texture-divider" aria-hidden="true"><BakerySymbolPattern /></div>
        <section className="table-orders" aria-labelledby="table-orders-title">
          <div className="table-orders-heading">
            <h2 id="table-orders-title" className="table-orders-table-id">MESA {session?.mesa}</h2>
          </div>
          {session?.pedidos.length ? <ul className="table-order-list">{session.pedidos.map(order => <li className="table-order-card" key={order.id}>
            <div className="table-order-code"><strong>{order.codigoSeguimiento}</strong></div>
            <span className={`table-order-status table-order-status--${order.estado.toLowerCase()}`}>{orderStatusLabel(order.estado)}</span>
            <strong className="table-order-total">{money(order.total)}</strong>
          </li>)}</ul> : <p className="table-orders-empty">Aún no hay pedidos asociados a esta mesa. Cuando envíes uno, podrás seguir aquí su estado y total.</p>}
        </section>
        {chosen.length > 0 && <div className="table-cart-bar"><span>{chosen.reduce((sum, item) => sum + cart[item.id], 0)} productos · {money(total)}</span><button onClick={() => setShowCart(true)}><ShoppingBag size={18} /> Ver pedido</button></div>}
        {showCart && <div className="table-cart-overlay" role="dialog" aria-modal="true" aria-label="Revisar pedido"><div className="table-cart"><button className="table-close" onClick={() => setShowCart(false)} aria-label="Cerrar resumen">×</button><PaperBreadBag /><h2>Tu pedido.</h2><ul>{chosen.map(item => <li key={item.id}>{cart[item.id]} × {item.nombre}<strong>{money(item.precio * cart[item.id])}</strong></li>)}</ul><div className="table-total">Total <strong>{money(total)}</strong></div><button className="table-submit" disabled={busy} onClick={send}>{busy ? "Enviando…" : "Enviar a la mesa"}</button></div></div>}
      </>}
  </main>;
}
