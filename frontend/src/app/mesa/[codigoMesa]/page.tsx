"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RefreshCw, ShoppingBag } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { PaperBreadBag } from "@/components/ui/paper-bread-bag";
import { BakerySymbolPattern } from "@/components/ui/bakery-symbol-pattern";
import { HeaderCornerFrame } from "@/components/ui/header-corner-frame";
import { LanguageSwitch, useI18n } from "@/lib/i18n";
import "./table.css";

type Category = { id: string; nombre: string };
type Product = { id: string; categoriaId: string; nombre: string; descripcion: string; imagen: string; precio: number };
type Session = { sesionId: string; mesa: string; codigoQrMesa: string; estadoSesion: string; estadoCuenta: string; expiraEn: string; pedidos: { id: string; codigoSeguimiento: string; estado: string; total: number }[] };
type Created = { id: string; codigoSeguimiento: string; estado: string; total: number };
const money = (amount: number) => {
  const locale = typeof document !== "undefined" && document.documentElement.lang === "en" ? "en-US" : "es-CO";
  return new Intl.NumberFormat(locale, { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(amount);
};
const orderStatusLabels: Record<string, string> = {
  PENDIENTE_CONFIRMACION: "Pendiente de confirmación",
  ACEPTADO: "Aceptado",
  EN_PREPARACION: "En preparación",
  LISTO: "Listo",
  COMPLETADO: "Completado",
  RECHAZADO: "Rechazado",
  CANCELACION_SOLICITADA: "Cancelación solicitada",
  CANCELADO: "Cancelado",
  VENCIDO: "Vencido",
};
const orderStatusLabel = (status: string, t: (text: string) => string) => t(orderStatusLabels[status] ?? status.replaceAll("_", " ").toLocaleLowerCase("es-CO"));
const invalidAccess = (failure: unknown) => failure instanceof ApiError && [404, 409].includes(failure.status)
  || failure instanceof Error && failure.message === "Este acceso temporal corresponde a otra mesa.";

export default function TablePage() {
  const { t } = useI18n();
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
  const cartButton = useRef<HTMLButtonElement>(null);
  const cartDialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCart) return;
    const dialog = cartDialog.current;
    const returnFocus = cartButton.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.querySelector<HTMLElement>("button:not(:disabled)")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setShowCart(false); returnFocus?.focus(); }
      if (event.key === "Tab" && dialog) {
        const items = Array.from(dialog.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled)"));
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (dialog?.contains(document.activeElement)) (returnFocus ?? previous)?.focus();
    };
  }, [showCart]);

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
      setCart({}); setShowCart(false); setNotice(t("Pedido enviado. El equipo confirmará su preparación."));
      setSession(await validate(token));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo enviar el pedido."); }
    finally { setBusy(false); }
  };

  return <><a className="skip" href="#mesa-content">{t("Saltar al contenido")}</a><main id="mesa-content" className="table-page">
    <header className="table-header" aria-label="Amankay">
      <div className="table-header-ornament table-header-ornament-left"><HeaderCornerFrame side="left" /></div>
      <Image src="/imagenes/marca/amankay.svg" alt="Amankay" width={88} height={96} />
      <LanguageSwitch className="table-language" />
      <div className="table-header-ornament table-header-ornament-right"><HeaderCornerFrame side="right" /></div>
    </header>
    {loading ? <div className="table-state" aria-live="polite"><RefreshCw className="table-spin" aria-hidden="true" /> {t("Preparando tu mesa…")}</div>
      : !token || error && !session ? <div className="table-state" role="status"><h1>{t("Tu mesa te espera.")}</h1><p>{error ? t(error) : t("Pide al personal que abra la sesión y te muestre el QR temporal de acceso.")}</p></div>
      : <>
        <section className="table-intro" aria-hidden="true"><BakerySymbolPattern /></section>
        {error && <p className="table-alert" role="alert">{t(error)}</p>}{notice && <p className="table-alert" role="status" aria-live="polite">{t(notice)}</p>}
        <nav className="table-categories" aria-label={t("Categorías")}><button type="button" aria-pressed={!categoryId} onClick={() => setCategoryId("")}>{t("Todos")}</button>{categories.map(group => <button type="button" aria-pressed={categoryId === group.id} onClick={() => setCategoryId(group.id)} key={group.id}>{t(group.nombre)}</button>)}</nav>
        <div className="table-grid">{visible.map(item => <article className="table-product" key={item.id}><div className="table-photo"><Image src={item.imagen} alt={t(item.nombre)} fill sizes="(max-width: 700px) 50vw, 250px" /></div><div className="table-product-info"><h2>{t(item.nombre)}</h2><strong>{money(item.precio)}</strong><p>{t(item.descripcion)}</p><div className="table-quantity"><button type="button" onClick={() => change(item.id, -1)} disabled={!cart[item.id]} aria-label={`${t("Quitar uno")} · ${t(item.nombre)}`}><Minus size={18} /></button><span aria-live="polite">{cart[item.id] ?? 0}</span><button type="button" onClick={() => change(item.id, 1)} aria-label={`${t("Agregar uno")} · ${t(item.nombre)}`}><Plus size={18} /></button></div></div></article>)}</div>
        <div className="table-texture-divider" aria-hidden="true"><BakerySymbolPattern /></div>
        <section className="table-orders" aria-labelledby="table-orders-title">
          <div className="table-orders-heading">
            <h2 id="table-orders-title" className="table-orders-table-id">MESA {session?.mesa}</h2>
          </div>
          {session?.pedidos.length ? <ul className="table-order-list">{session.pedidos.map(order => <li className="table-order-card" key={order.id}>
            <div className="table-order-code"><strong>{order.codigoSeguimiento}</strong></div>
            <span className={`table-order-status table-order-status--${order.estado.toLowerCase()}`}>{orderStatusLabel(order.estado, t)}</span>
            <strong className="table-order-total">{money(order.total)}</strong>
          </li>)}</ul> : <p className="table-orders-empty">{t("Aún no hay pedidos asociados a esta mesa. Cuando envíes uno, podrás seguir aquí su estado y total.")}</p>}
        </section>
        {chosen.length > 0 && <div className="table-cart-bar"><span aria-live="polite">{chosen.reduce((sum, item) => sum + cart[item.id], 0)} {t("productos")} · {money(total)}</span><button ref={cartButton} onClick={() => setShowCart(true)}><ShoppingBag size={18} aria-hidden="true" /> {t("Ver pedido")}</button></div>}
        {showCart && <div className="table-cart-overlay" role="dialog" aria-modal="true" aria-labelledby="table-cart-title"><div ref={cartDialog} className="table-cart"><button className="table-close" onClick={() => { setShowCart(false); cartButton.current?.focus(); }} aria-label={t("Cerrar resumen")}>×</button><PaperBreadBag /><h2 id="table-cart-title">{t("Tu pedido.")}</h2><ul>{chosen.map(item => <li key={item.id}>{cart[item.id]} × {item.nombre}<strong>{money(item.precio * cart[item.id])}</strong></li>)}</ul><div className="table-total">{t("Total estimado")} <strong>{money(total)}</strong></div><button className="table-submit" disabled={busy} onClick={send}>{busy ? t("Enviando…") : t("Enviar a la mesa")}</button></div></div>}
      </>}
  </main></>;
}
