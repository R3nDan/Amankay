"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Clock3, RefreshCw } from "lucide-react";
import { useAdmin } from "@/components/admin/admin-shell";
import { ManualOrderForm } from "@/components/admin/manual-order-form";
import { api } from "@/lib/api";

type Order = { id: string; codigoSeguimiento: string; estado: string; modalidad: string; creadoEn: string; venceEn?: string; total: number; sucursalId?: string; priority?: boolean };
type Detail = { pedido: Order; tipo: string; canalOrigen: string; nombreCliente?: string; telefonoCliente?: string; direccionEntrega?: string; barrio?: string; referenciaDireccion?: string; nombreDestinatario?: string; telefonoDestinatario?: string; cuentaMesaId?: string; items: { producto: string; cantidad: number; precioUnitario: number }[] };
type Decision = { kind: "reject" | "cancel-approve" | "cancel-deny"; order: Order };
const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const nextState: Record<string, { state: string; label: string }> = {
  ACEPTADO: { state: "EN_PREPARACION", label: "Iniciar preparación" },
  EN_PREPARACION: { state: "LISTO", label: "Marcar listo" },
  LISTO: { state: "COMPLETADO", label: "Completar pedido" },
};

export default function OrdersPage() {
  const { staff, branchId, branches } = useAdmin();
  const canOperate = staff.roles.includes("ATENCION");
  const [queue, setQueue] = useState<Order[]>([]);
  const [unassigned, setUnassigned] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [arrivalNotice, setArrivalNotice] = useState("");
  const knownOrders = useRef<Set<string> | null>(null);
  const audio = useRef<AudioContext | null>(null);

  const enableSound = async () => {
    if (soundEnabled) { setSoundEnabled(false); return; }
    try {
      audio.current ??= new AudioContext();
      await audio.current.resume();
      setSoundEnabled(true);
    } catch { setError("El navegador no permitió activar los avisos sonoros."); }
  };

  const refresh = useCallback(async () => {
    if (!branchId || !canOperate) { setQueue([]); setUnassigned([]); setHistory([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [branchOrders, unassignedOrders, finishedOrders] = await Promise.all([
        api<Order[]>(`/staff/orders/queue?sucursalId=${encodeURIComponent(branchId)}`),
        api<Order[]>("/staff/orders/unassigned"),
        api<Order[]>(`/staff/orders/history?sucursalId=${encodeURIComponent(branchId)}`),
      ]);
      const now = Date.now();
      const incoming = [...branchOrders, ...unassignedOrders];
      if (knownOrders.current) {
        const arrivals = incoming.filter(order => order.estado === "PENDIENTE_CONFIRMACION" && !knownOrders.current?.has(order.id));
        if (arrivals.length) {
          setArrivalNotice(`${arrivals.length} pedido${arrivals.length === 1 ? " nuevo" : "s nuevos"} por atender.`);
          if (soundEnabled && audio.current) {
            const context = audio.current;
            const tone = context.createOscillator();
            const volume = context.createGain();
            tone.type = "sine"; tone.frequency.value = 660;
            volume.gain.setValueAtTime(0.0001, context.currentTime);
            volume.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.04);
            volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.32);
            tone.connect(volume).connect(context.destination);
            tone.start(); tone.stop(context.currentTime + 0.34);
          }
        }
      }
      knownOrders.current = new Set(incoming.map(order => order.id));
      setQueue(branchOrders.map(order => ({ ...order, priority: order.estado === "PENDIENTE_CONFIRMACION" && now - new Date(order.creadoEn).getTime() > 180000 })));
      setUnassigned(unassignedOrders); setHistory(finishedOrders); setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron cargar los pedidos."); }
    finally { setLoading(false); }
  }, [branchId, canOperate, soundEnabled]);

  useEffect(() => { knownOrders.current = null; }, [branchId]);
  useEffect(() => () => { void audio.current?.close(); }, []);

  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
    const timer = setInterval(() => { void refresh(); }, 30000);
    return () => clearInterval(timer);
  }, [refresh]);

  const show = async (order: Order) => {
    setError("");
    try { setSelected(await api<Detail>(`/staff/orders/${order.id}`)); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo consultar el pedido."); }
  };

  const act = async (order: Order, path: string, body?: object) => {
    setBusyId(order.id); setError(""); setNotice("");
    try {
      await api(`/staff/orders/${order.id}/${path}`, { method: path === "status" ? "PATCH" : "POST", body: body ? JSON.stringify(body) : undefined });
      setNotice(`Pedido ${order.codigoSeguimiento} actualizado.`);
      setDecision(null); setReason("");
      await refresh();
      if (selected?.pedido.id === order.id) await show(order);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo actualizar el pedido."); }
    finally { setBusyId(""); }
  };

  const decide = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!decision || !reason.trim()) return;
    if (decision.kind === "reject") void act(decision.order, "reject", { motivo: reason.trim() });
    else void act(decision.order, "cancellation/decision", { aprobar: decision.kind === "cancel-approve", motivo: reason.trim() });
  };

  if (!canOperate) return <p className="admin-message admin-message-error" role="alert">Tu rol no tiene acceso a la operación de pedidos.</p>;
  const pending = queue.filter(order => order.estado === "PENDIENTE_CONFIRMACION");
  const cancellations = queue.filter(order => order.estado === "CANCELACION_SOLICITADA");
  const underway = queue.filter(order => !["PENDIENTE_CONFIRMACION", "CANCELACION_SOLICITADA"].includes(order.estado));
  const name = branches.find(branch => branch.id === branchId)?.nombre ?? "la sucursal";

  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">ATENCIÓN · {name.toUpperCase()}</span><h1>Pedidos <em>en movimiento.</em></h1><p>La cola sigue el orden de llegada. Cada cambio de estado se valida y registra en Java.</p></div>
    <div className="admin-section-tools"><span>{pending.length} por confirmar · {underway.length} en curso</span><div className="admin-table-actions"><button type="button" onClick={() => void enableSound()} aria-pressed={soundEnabled}>{soundEnabled ? "Desactivar avisos" : "Activar avisos sonoros"}</button><button type="button" onClick={() => void refresh()}><RefreshCw size={16} aria-hidden="true" /> Actualizar</button></div></div>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    {arrivalNotice && <p className="admin-message admin-arrival" role="status">{arrivalNotice} <button type="button" onClick={() => setArrivalNotice("")} aria-label="Ocultar aviso">×</button></p>}
    {loading && queue.length === 0 && unassigned.length === 0 && <p className="admin-empty">Consultando pedidos…</p>}
    <ManualOrderForm branchId={branchId} onCreated={code => { setNotice(`Pedido ${code} registrado y agregado a la cola.`); void refresh(); }} />
    {unassigned.length > 0 && <OrderGroup title="Domicilios por asignar" description="Asigna la sede que pueda completar el pedido entero antes de confirmarlo." orders={unassigned} render={order => <OrderCard key={order.id} order={order} busy={busyId === order.id} onDetail={show} action={<button disabled={!!busyId || !branchId} onClick={() => void act(order, "branch", { sucursalId: branchId })}>Asignar a {name}</button>} />} />}
    <OrderGroup title="Por confirmar" description="Primero los más antiguos. Los pedidos web vencen a los treinta minutos si siguen pendientes." orders={pending} empty={!loading ? "No hay pedidos pendientes." : undefined} render={order => <OrderCard key={order.id} order={order} busy={busyId === order.id} onDetail={show} action={<><button disabled={!!busyId} onClick={() => { setDecision({ kind: "reject", order }); setReason(""); }}>Rechazar</button><button className="admin-fill" disabled={!!busyId} onClick={() => void act(order, "accept")}>Aceptar</button></>} />} />
    <OrderGroup title="Cancelaciones solicitadas" description="Atención decide antes de iniciar la preparación." orders={cancellations} render={order => <OrderCard key={order.id} order={order} busy={busyId === order.id} onDetail={show} action={<><button disabled={!!busyId} onClick={() => { setDecision({ kind: "cancel-deny", order }); setReason(""); }}>No aprobar</button><button className="admin-fill" disabled={!!busyId} onClick={() => { setDecision({ kind: "cancel-approve", order }); setReason(""); }}>Aprobar</button></>} />} />
    <OrderGroup title="En curso" description="La preparación, entrega y cierre avanzan en el orden permitido por Java." orders={underway} empty={!loading ? "No hay pedidos en curso." : undefined} render={order => <OrderCard key={order.id} order={order} busy={busyId === order.id} onDetail={show} action={nextState[order.estado] && <button className="admin-fill" disabled={!!busyId} onClick={() => void act(order, "status", { estado: nextState[order.estado].state })}>{nextState[order.estado].label}</button>} />} />
    <OrderGroup title="Historial reciente" description="Últimos 30 pedidos finalizados de esta sucursal." orders={history} empty={!loading ? "Aún no hay pedidos finalizados." : undefined} render={order => <OrderCard key={order.id} order={order} busy={busyId === order.id} onDetail={show} />} />
    {decision && <form className="admin-reject" onSubmit={decide}><label htmlFor="decision-reason">Motivo de {decision.kind === "reject" ? "rechazo" : "la decisión"} · {decision.order.codigoSeguimiento}</label><input id="decision-reason" value={reason} onChange={event => setReason(event.target.value)} required minLength={3} maxLength={240} autoFocus /><button type="button" onClick={() => setDecision(null)}>Volver</button><button className="admin-fill" disabled={!!busyId}>Confirmar</button></form>}
    {selected && <section className="admin-session-detail admin-order-detail" aria-labelledby="order-detail-title"><div className="admin-section-tools"><h2 id="order-detail-title">Pedido {selected.pedido.codigoSeguimiento}</h2><button onClick={() => setSelected(null)} aria-label="Cerrar detalle">Cerrar ×</button></div><p>{selected.canalOrigen} · {selected.tipo} · {selected.pedido.modalidad} · {selected.pedido.estado}</p><ul>{selected.items.map((item, index) => <li key={`${item.producto}-${index}`}>{item.cantidad} × {item.producto}<strong>{money(item.cantidad * item.precioUnitario)}</strong></li>)}</ul><div className="admin-order-total">Total <strong>{money(selected.pedido.total)}</strong></div>{selected.nombreCliente && <p>Cliente: {selected.nombreCliente} · {selected.telefonoCliente}</p>}{selected.direccionEntrega && <p>Entrega: {selected.direccionEntrega}{selected.barrio && ` · ${selected.barrio}`}{selected.referenciaDireccion && ` · ${selected.referenciaDireccion}`}</p>}{selected.nombreDestinatario && <p>Destinatario: {selected.nombreDestinatario} · {selected.telefonoDestinatario}</p>}{selected.cuentaMesaId && <p>Pedido de cuenta de mesa.</p>}</section>}
  </>;
}

function OrderGroup({ title, description, orders, empty, render }: { title: string; description: string; orders: Order[]; empty?: string; render: (order: Order) => React.ReactNode }) {
  if (!orders.length && !empty) return null;
  return <section className="admin-orders-group"><h2>{title}</h2><p>{description}</p>{orders.length ? <div className="admin-order-list">{orders.map(render)}</div> : <p className="admin-empty">{empty}</p>}</section>;
}

function OrderCard({ order, busy, onDetail, action }: { order: Order; busy: boolean; onDetail: (order: Order) => void; action?: React.ReactNode }) {
  return <article className="admin-order-card"><div><span className="admin-eyebrow">{order.modalidad ?? "MESA"} · {order.estado}</span><h3>{order.codigoSeguimiento}</h3><p><Clock3 size={15} aria-hidden="true" /> {new Date(order.creadoEn).toLocaleString("es-CO")} {order.venceEn && `· Vence ${new Date(order.venceEn).toLocaleTimeString("es-CO")}`}</p>{order.priority && <span className="admin-priority">Atención prioritaria</span>}</div><div className="admin-order-end"><strong>{money(order.total)}</strong><div className="admin-table-actions"><button disabled={busy} onClick={() => void onDetail(order)}>Detalle <ArrowRight size={15} aria-hidden="true" /></button>{action}</div></div></article>;
}
