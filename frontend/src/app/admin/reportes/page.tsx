"use client";

import { useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";

type Sales = { sucursalId: string; desde: string; hasta: string; pedidosCompletados: number; ventasCOP: number };
type Order = { id: string; codigoSeguimiento: string; estado: string; modalidad: string; creadoEn: string; total: number };
type Stock = { id: string; productoId: string; producto: string; disponible: number; actualizadoEn: string };
type Movement = { id: string; producto: string; tipo: string; cantidad: number; stockAnterior: number; stockResultante: number; fecha: string; motivo: string; tipoOrigen: string; idOrigen: string };
type Replenishment = { id: string; estado: string; fecha: string; sucursalProveedoraId: string };
const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

export default function ReportsPage() {
  const { staff, branchId, branches } = useAdmin();
  const canSales = staff.roles.some(role => ["ATENCION", "ADMINISTRADOR"].includes(role));
  const canInventory = staff.roles.some(role => ["INVENTARIO", "ADMINISTRADOR"].includes(role));
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sales, setSales] = useState<Sales | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [replenishments, setReplenishments] = useState<Replenishment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const run = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!branchId) return;
    setLoading(true); setError(""); setLoaded(false);
    try {
      const range = new URLSearchParams({ sucursalId: branchId, desde: new Date(`${from}T00:00:00`).toISOString(), hasta: new Date(`${to}T23:59:59.999`).toISOString() });
      const branch = new URLSearchParams({ sucursalId: branchId });
      const [salesResult, ordersResult, stockResult, movementResult, replenishmentResult] = await Promise.all([
        canSales ? api<Sales>(`/reports/sales?${range}`) : Promise.resolve(null),
        canSales ? api<Order[]>(`/reports/orders?${range}`) : Promise.resolve([]),
        canInventory ? api<Stock[]>(`/reports/inventory?${branch}`) : Promise.resolve([]),
        canInventory ? api<Movement[]>(`/reports/inventory/movements?${branch}`) : Promise.resolve([]),
        canInventory ? api<Replenishment[]>(`/reports/replenishments?${branch}`) : Promise.resolve([]),
      ]);
      setSales(salesResult); setOrders(ordersResult); setStock(stockResult); setMovements(movementResult); setReplenishments(replenishmentResult); setLoaded(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron generar los reportes."); }
    finally { setLoading(false); }
  };
  if (!canSales && !canInventory) return <p className="admin-message admin-message-error" role="alert">Tu rol no tiene acceso a reportes.</p>;
  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">CONSULTA OPERATIVA</span><h1>Reportes <em>de Amankay.</em></h1><p>Ventas y estados de pedidos por periodo; inventario y reposiciones por sucursal. Los datos proceden de PostgreSQL mediante Java.</p></div>
    <form className="admin-manual-order admin-manual-form" onSubmit={run}><div className="admin-form-grid"><label>Desde<input type="date" value={from} max={to || undefined} onChange={event => setFrom(event.target.value)} required /></label><label>Hasta<input type="date" value={to} min={from || undefined} onChange={event => setTo(event.target.value)} required /></label></div><p className="admin-form-note">Sucursal: {branches.find(row => row.id === branchId)?.nombre ?? "Selecciona una sucursal"}. El intervalo aplica a ventas y pedidos.</p><button className="admin-primary-button" disabled={loading || !branchId}>{loading ? "Consultando…" : "Generar reportes"}</button></form>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {loaded && <>
      {sales && <section className="admin-dashboard-section"><h2>Ventas del periodo</h2><div className="admin-metrics"><div className="admin-metric"><strong>{sales.pedidosCompletados}</strong><span>Pedidos completados</span></div><div className="admin-metric"><strong>{money(sales.ventasCOP)}</strong><span>Total de pedidos completados</span></div></div></section>}
      {canSales && <section className="admin-dashboard-section"><h2>Historial y estados</h2>{orders.length ? <div className="admin-order-list">{orders.map(row => <article key={row.id} className="admin-order-card"><div><span className="admin-eyebrow">{row.estado} · {row.modalidad}</span><h3>{row.codigoSeguimiento}</h3><p>{new Date(row.creadoEn).toLocaleString("es-CO")}</p></div><strong>{money(row.total)}</strong></article>)}</div> : <p className="admin-empty">No hay pedidos en el periodo seleccionado.</p>}</section>}
      {canInventory && <section className="admin-dashboard-section"><h2>Inventario actual</h2>{stock.length ? <div className="admin-order-list">{stock.map(row => <article className="admin-order-card" key={row.id}><div><h3>{row.producto}</h3><p>Actualizado {new Date(row.actualizadoEn).toLocaleString("es-CO")}</p></div><strong>{row.disponible} unidades</strong></article>)}</div> : <p className="admin-empty">No hay inventario registrado en esta sucursal.</p>}</section>}
      {canInventory && <section className="admin-dashboard-section"><h2>Movimientos de inventario</h2>{movements.length ? <div className="admin-order-list">{movements.map(row => <article className="admin-order-card" key={row.id}><div><span className="admin-eyebrow">{row.tipo.replaceAll("_", " ")} · {new Date(row.fecha).toLocaleString("es-CO")}</span><h3>{row.producto}</h3><p>{row.motivo}</p><small>Origen: {row.tipoOrigen.replaceAll("_", " ")} · {row.idOrigen.slice(0, 8)}</small></div><strong>{row.stockAnterior} → {row.stockResultante} unidades</strong></article>)}</div> : <p className="admin-empty">No hay movimientos de inventario en esta sucursal.</p>}</section>}
      {canInventory && <section className="admin-dashboard-section"><h2>Reposiciones</h2>{replenishments.length ? <div className="admin-order-list">{replenishments.map(row => <article className="admin-order-card" key={row.id}><div><span className="admin-eyebrow">{row.estado}</span><h3>Solicitud {row.id.slice(0, 8)}</h3><p>{new Date(row.fecha).toLocaleString("es-CO")}</p></div></article>)}</div> : <p className="admin-empty">No hay reposiciones relacionadas con esta sucursal.</p>}</section>}
    </>}
  </>;
}
