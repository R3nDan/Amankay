"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";

type Delivery = { id: string; pedidoId: string; repartidorId: string; estado: string; creadoEn: string; observaciones?: string; montoEfectivoDeclarado?: number; destinatario?: string; telefono?: string; direccion?: string; barrio?: string; referencia?: string; latitud?: number; longitud?: number; productos: { producto: string; cantidad: number }[] };
type Driver = { id: string; nombre: string; apellido: string };
type Order = { id: string; codigoSeguimiento: string; estado: string; modalidad: string };
const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const date = (value: string) => new Date(value).toLocaleString("es-CO");

export default function DeliveriesPage() {
  const { staff, branchId, branches } = useAdmin();
  const attention = staff.roles.includes("ATENCION");
  const driver = staff.roles.includes("REPARTIDOR");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [orderId, setOrderId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [reason, setReason] = useState("");
  const [cash, setCash] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!attention && !driver) return;
    setLoading(true);
    try {
      if (attention && branchId) {
        const [rows, people, queue] = await Promise.all([
          api<Delivery[]>(`/staff/deliveries?sucursalId=${branchId}`),
          api<Driver[]>(`/staff/drivers?sucursalId=${branchId}`),
          api<Order[]>(`/staff/orders/queue?sucursalId=${branchId}`),
        ]);
        setDeliveries(rows); setDrivers(people); setOrders(queue);
      } else if (driver) setDeliveries(await api<Delivery[]>("/driver/deliveries"));
      setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron consultar las entregas."); }
    finally { setLoading(false); }
  }, [attention, branchId, driver]);

  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);
  const act = async (path: string, body: object, message: string) => {
    setBusy(true); setError(""); setNotice("");
    try { await api(path, { method: "POST", body: JSON.stringify(body) }); setNotice(message); setReason(""); await refresh(); setSelected(null); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo actualizar la entrega."); }
    finally { setBusy(false); }
  };
  const assign = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (orderId && driverId) void act(`/staff/orders/${orderId}/delivery`, { repartidorId: driverId }, "Entrega asignada."); };
  const update = (state: string) => { if (selected) void act(`/driver/deliveries/${selected.id}/status`, { estado: state, observaciones: reason.trim() || null }, `Entrega actualizada a ${state}.`); };
  const retry = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (selected && reason.trim()) void act(`/staff/deliveries/${selected.id}/retry`, { repartidorId: driverId || null, motivo: reason.trim() }, "Reintento autorizado."); };
  const declare = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (selected) void act(`/driver/deliveries/${selected.id}/cash-declaration`, { monto: cash }, "Efectivo declarado."); };
  if (!attention && !driver) return <p className="admin-message admin-message-error" role="alert">Tu rol no tiene acceso a entregas.</p>;
  const eligible = orders.filter(order => order.modalidad === "DOMICILIO" && ["ACEPTADO", "EN_PREPARACION", "LISTO"].includes(order.estado) && !deliveries.some(delivery => delivery.pedidoId === order.id));
  const driverName = (id: string) => { const person = drivers.find(row => row.id === id); return person ? `${person.nombre} ${person.apellido}` : "Repartidor asignado"; };
  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">{attention ? "OPERACIÓN DE DOMICILIOS" : "MIS DOMICILIOS"}</span><h1>Entregas <em>en camino.</em></h1><p>{attention ? "Asigna repartidores y decide reintentos; el repartidor registra el recorrido y sus incidencias." : "Consulta tus entregas y registra cada paso del recorrido."}</p></div>
    <div className="admin-section-tools"><span>{branches.find(row => row.id === branchId)?.nombre ?? "Amankay"}</span><button type="button" onClick={() => void refresh()} disabled={loading}>Actualizar</button></div>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    {loading && <p role="status">Cargando entregas…</p>}
    {attention && <section className="admin-manual-order"><h2>Asignar un domicilio</h2><form className="admin-manual-form" onSubmit={assign}><div className="admin-form-grid"><label>Pedido aceptado<select value={orderId} onChange={event => setOrderId(event.target.value)} required><option value="">Selecciona uno</option>{eligible.map(order => <option key={order.id} value={order.id}>{order.codigoSeguimiento}</option>)}</select></label><label>Repartidor de la sucursal<select value={driverId} onChange={event => setDriverId(event.target.value)} required><option value="">Selecciona uno</option>{drivers.map(person => <option key={person.id} value={person.id}>{person.nombre} {person.apellido}</option>)}</select></label></div><button className="admin-primary-button" disabled={busy || !eligible.length || !drivers.length}>Asignar entrega</button></form>{!drivers.length && <p className="admin-form-note">No hay repartidores activos asignados a esta sucursal.</p>}</section>}
    <section className="admin-dashboard-section"><h2>{attention ? "Entregas de la sucursal" : "Mis entregas"}</h2>{deliveries.length ? <div className="admin-order-list">{deliveries.map(row => <article key={row.id} className="admin-order-card"><div><span className="admin-eyebrow">{row.estado}</span><h3>{row.destinatario ?? "Entrega"}</h3><p>{date(row.creadoEn)} · {attention ? driverName(row.repartidorId) : row.direccion}</p></div><div className="admin-order-end"><button type="button" onClick={() => { setSelected(row); setReason(""); setDriverId(""); }}>Ver entrega</button></div></article>)}</div> : !loading && <p className="admin-empty">No hay entregas registradas.</p>}</section>
    {selected && <section className="admin-session-detail" aria-labelledby="delivery-title"><div className="admin-section-tools"><h2 id="delivery-title">Entrega · {selected.estado}</h2><button type="button" onClick={() => setSelected(null)}>Cerrar</button></div><p>Destinatario: {selected.destinatario ?? "—"} · {selected.telefono ?? "Sin teléfono"}</p><p>Dirección: {selected.direccion ?? "—"}{selected.barrio && ` · ${selected.barrio}`}{selected.referencia && ` · ${selected.referencia}`}</p>{selected.latitud != null && selected.longitud != null && <p>Ubicación compartida: {selected.latitud}, {selected.longitud}</p>}<ul>{selected.productos.map((line, index) => <li key={`${line.producto}-${index}`}>{line.cantidad} × {line.producto}</li>)}</ul>{selected.observaciones && <p>Observaciones: {selected.observaciones}</p>}
      {driver && selected.repartidorId === staff.id && <div className="admin-operation-block"><h3>Registrar recorrido</h3>{selected.estado === "ASIGNADA" && <button className="admin-primary-button" disabled={busy} onClick={() => update("RECOGIDA")}>Pedido recogido</button>}{selected.estado === "RECOGIDA" && <button className="admin-primary-button" disabled={busy} onClick={() => update("EN_CAMINO")}>Salir a domicilio</button>}{selected.estado === "EN_CAMINO" && <><label>Observación de incidencia (obligatoria si no se entregó)<input value={reason} onChange={event => setReason(event.target.value)} maxLength={500} /></label><div className="admin-table-actions"><button className="admin-fill" disabled={busy} onClick={() => update("ENTREGADA")}>Entregada</button><button disabled={busy || !reason.trim()} onClick={() => update("NO_ENTREGADA")}>No entregada</button></div></>}{selected.estado === "ENTREGADA" && <form className="admin-manual-form" onSubmit={declare}><h3>Efectivo declarado</h3><label>Monto recibido en COP<input type="number" min={0} step="0.01" value={cash} onChange={event => setCash(Number(event.target.value))} required /></label><button className="admin-primary-button" disabled={busy}>Declarar {money(cash)}</button></form>}</div>}
      {attention && selected.estado === "NO_ENTREGADA" && <form className="admin-manual-form admin-operation-block" onSubmit={retry}><h3>Autorizar reintento</h3><label>Repartidor<select value={driverId} onChange={event => setDriverId(event.target.value)}><option value="">Conservar al repartidor actual</option>{drivers.map(person => <option key={person.id} value={person.id}>{person.nombre} {person.apellido}</option>)}</select></label><label>Motivo<input value={reason} onChange={event => setReason(event.target.value)} minLength={3} maxLength={500} required /></label><button className="admin-primary-button" disabled={busy}>Autorizar reintento</button></form>}
    </section>}
  </>;
}
