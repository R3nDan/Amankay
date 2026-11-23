"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Clock3, LayoutGrid, RefreshCw } from "lucide-react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";

type Order = { id: string; estado: string; creadoEn: string; codigoSeguimiento: string; priority?: boolean };
type Table = { id: string; estadoSesion?: string; estadoCuenta?: string };
type Stock = { id: string; disponible: number };
type Replenishment = { id: string; estado: string };
type Delivery = { id: string; estado: string };
type Overview = { orders?: Order[]; tables?: Table[]; stocks?: Stock[]; replenishments?: Replenishment[]; deliveries?: Delivery[] };

export default function AdminHome() {
  const { staff, branches, branchId } = useAdmin();
  const branch = branches.find(row => row.id === branchId);
  const attention = staff.roles.includes("ATENCION");
  const inventory = staff.roles.includes("INVENTARIO");
  const driver = staff.roles.includes("REPARTIDOR");
  const [data, setData] = useState<Overview>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!branchId && !driver) return;
    setLoading(true); setError("");
    try {
      const result: Overview = {};
      const jobs: Promise<void>[] = [];
      if (branchId && attention) {
        jobs.push(api<Order[]>(`/staff/orders/queue?sucursalId=${encodeURIComponent(branchId)}`).then(rows => { const now = Date.now(); result.orders = rows.map(row => ({ ...row, priority: row.estado === "PENDIENTE_CONFIRMACION" && now - new Date(row.creadoEn).getTime() >= 180000 })); }));
        jobs.push(api<Table[]>(`/tables?sucursalId=${encodeURIComponent(branchId)}`).then(rows => { result.tables = rows; }));
        jobs.push(api<Delivery[]>(`/staff/deliveries?sucursalId=${encodeURIComponent(branchId)}`).then(rows => { result.deliveries = rows; }));
      }
      if (branchId && inventory) {
        jobs.push(api<Stock[]>(`/inventory?sucursalId=${encodeURIComponent(branchId)}`).then(rows => { result.stocks = rows; }));
        jobs.push(api<Replenishment[]>(`/reports/replenishments?sucursalId=${encodeURIComponent(branchId)}`).then(rows => { result.replenishments = rows; }));
      }
      if (driver) jobs.push(api<Delivery[]>("/driver/deliveries").then(rows => { result.deliveries = rows; }));
      await Promise.all(jobs);
      setData(result);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo cargar el tablero."); }
    finally { setLoading(false); }
  }, [branchId, attention, inventory, driver]);

  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);

  const pending = data.orders?.filter(row => row.estado === "PENDIENTE_CONFIRMACION") ?? [];
  const urgent = pending.filter(row => row.priority);
  const activeTables = data.tables?.filter(row => row.estadoSesion === "ACTIVA") ?? [];
  const lowStock = data.stocks?.filter(row => row.disponible <= 5) ?? [];
  const activeReplenishments = data.replenishments?.filter(row => !["COMPLETADA", "RECHAZADA", "CANCELADA"].includes(row.estado)) ?? [];
  const activeDeliveries = data.deliveries?.filter(row => !["ENTREGADA", "NO_ENTREGADA"].includes(row.estado)) ?? [];

  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">TU JORNADA EN AMANKAY</span><h1>Buen día, <em>{staff.nombre}.</em></h1><p>Información actual de tu operación en {branch?.nombre ?? "Amankay"}.</p></div>
    <div className="admin-section-tools"><span>{loading ? "Actualizando…" : "Datos de la API"}</span><button type="button" onClick={() => void refresh()} disabled={loading}><RefreshCw size={16} aria-hidden="true" /> Actualizar</button></div>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    <div className="admin-home-grid">
      <section className="admin-feature"><LayoutGrid aria-hidden="true" /><span>OPERACIÓN</span><h2>{branch?.nombre ?? "Tu espacio de trabajo"}</h2><p>{branch?.direccion ?? "Selecciona una sucursal para comenzar."}</p>{attention && <Link href="/admin/pedidos">Atender pedidos <ArrowUpRight size={18} aria-hidden="true" /></Link>}</section>
      <section className="admin-feature admin-feature-light"><Clock3 aria-hidden="true" /><span>ACCESO</span><h2>Todo en su lugar.</h2><p>Tu cuenta muestra las áreas de sus roles. Java vuelve a comprobar los permisos y la sucursal en cada operación.</p>{attention && <Link href="/admin/mesas">Gestionar mesas <ArrowUpRight size={18} aria-hidden="true" /></Link>}</section>
    </div>
    {attention && <section className="admin-dashboard-section"><h2>Atención en este momento</h2><div className="admin-metrics"><Metric value={pending.length} label="Por confirmar" href="/admin/pedidos" /><Metric value={urgent.length} label="Más de 3 minutos" href="/admin/pedidos" /><Metric value={activeTables.length} label="Mesas con sesión" href="/admin/mesas" /><Metric value={activeDeliveries.length} label="Entregas en curso" /></div></section>}
    {inventory && <section className="admin-dashboard-section"><h2>Inventario y reposiciones</h2><div className="admin-metrics"><Metric value={data.stocks?.length ?? 0} label="Productos con inventario" /><Metric value={lowStock.length} label="Con 5 unidades o menos" /><Metric value={activeReplenishments.length} label="Reposiciones en curso" /></div><p className="admin-form-note">El umbral de 5 unidades es una referencia visual del tablero; no cambia las reglas de inventario.</p></section>}
    {driver && <section className="admin-dashboard-section"><h2>Mis entregas</h2><div className="admin-metrics"><Metric value={activeDeliveries.length} label="Asignadas o en camino" /></div></section>}
    {!attention && !inventory && !driver && <p className="admin-empty">Desde aquí podrás acceder a la configuración y los reportes autorizados para tu rol.</p>}
  </>;
}

function Metric({ value, label, href }: { value: number; label: string; href?: string }) {
  const content = <><strong>{value}</strong><span>{label}</span>{href && <ArrowUpRight size={17} aria-hidden="true" />}</>;
  return href ? <Link href={href} className="admin-metric">{content}</Link> : <div className="admin-metric">{content}</div>;
}
