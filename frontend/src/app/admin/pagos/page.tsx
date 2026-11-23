"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";

type Order = { id: string; codigoSeguimiento: string; estado: string; tipo: string };
type Table = { id: string; identificador: string; sesionId?: string; cuentaId?: string; estadoCuenta?: string };
type TableSession = { mesa: string; estadoCuenta: string; pedidos: { id: string; codigoSeguimiento: string; estado: string; creadoEn: string; total: number }[] };
type Payment = { id: string; pedidoId?: string; cuentaMesaId?: string; metodo: string; estado: string; importe: number; creadoEn: string; confirmadoEn?: string; motivoRechazo?: string };
type Origin = { kind: "orders" | "accounts"; id: string };
const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

export default function PaymentsPage() {
  const { staff, branchId, branches } = useAdmin();
  const allowed = staff.roles.includes("ATENCION");
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [accountSession, setAccountSession] = useState<TableSession | null>(null);
  const [accountSessionLoading, setAccountSessionLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [method, setMethod] = useState("EFECTIVO");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [decision, setDecision] = useState<{ id: string; kind: "reject" | "refund" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!allowed || !branchId) return;
    setLoading(true);
    try {
      const [queue, history, tableRows] = await Promise.all([
        api<Order[]>(`/staff/orders/queue?sucursalId=${branchId}`),
        api<Order[]>(`/staff/orders/history?sucursalId=${branchId}`),
        api<Table[]>(`/tables?sucursalId=${branchId}`),
      ]);
      setOrders([...queue, ...history].filter(order => order.tipo === "EXTERNO")); setTables(tableRows); setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron cargar los cobros."); }
    finally { setLoading(false); }
  }, [allowed, branchId]);

  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);

  const loadPayments = async (selected: Origin) => {
    setOrigin(selected); setError(""); setAccountSession(null);
    const table = selected.kind === "accounts" ? tables.find(row => row.cuentaId === selected.id) : undefined;
    setAccountSessionLoading(selected.kind === "accounts" && !!table?.sesionId);
    try {
      const [attempts, session] = await Promise.all([
        api<Payment[]>(`/payments/${selected.kind}/${selected.id}`),
        selected.kind === "accounts" && table?.sesionId
          ? api<TableSession>(`/tables/sessions/${table.sesionId}`)
          : Promise.resolve(null),
      ]);
      setPayments(attempts); setAccountSession(session);
    }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron consultar los pagos y pedidos de esta cuenta."); }
    finally { setAccountSessionLoading(false); }
  };

  const act = async (path: string, body: object | FormData | undefined, message: string) => {
    setBusy(true); setError(""); setNotice("");
    try {
      await api(path, { method: "POST", body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
      setNotice(message); setDecision(null); setReason(""); setFile(null);
      if (origin) await loadPayments(origin);
      await refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo actualizar el pago."); }
    finally { setBusy(false); }
  };

  const create = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (origin) void act(`/payments/${origin.kind}/${origin.id}/attempts`, { metodo: method }, "Intento de pago creado por el saldo pendiente completo."); };
  const submitDecision = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!decision || !reason.trim()) return; const path = decision.kind === "reject" ? "verification" : "refund"; const body = decision.kind === "reject" ? { aprobar: false, motivo: reason.trim() } : { motivo: reason.trim() }; void act(`/payments/${decision.id}/${path}`, body, decision.kind === "reject" ? "Transferencia rechazada." : "Reembolso total registrado."); };
  const upload = (event: FormEvent<HTMLFormElement>, id: string) => { event.preventDefault(); if (!file) return; const body = new FormData(); body.set("archivo", file); void act(`/payments/${id}/receipt`, body, "Comprobante recibido para revisión."); };
  const download = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/payments/${id}/receipt`, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo descargar el comprobante.");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `comprobante-${id}`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo descargar el comprobante."); }
  };

  if (!allowed) return <p className="admin-message admin-message-error" role="alert">Tu rol no tiene acceso a los pagos.</p>;
  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">COBROS · {branches.find(row => row.id === branchId)?.nombre.toUpperCase() ?? "AMANKAY"}</span><h1>Pagos <em>con claridad.</em></h1><p>Cada intento cubre el saldo pendiente completo. Las transferencias requieren comprobante y revisión antes de preparar el pedido.</p></div>
    <div className="admin-section-tools"><span>{orders.length} pedidos externos · {tables.filter(row => row.cuentaId).length} cuentas vinculadas a mesas</span><button type="button" onClick={() => void refresh()} disabled={loading}>Actualizar</button></div>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    {loading && <p role="status">Cargando cobros…</p>}
    <div className="admin-form-grid admin-payment-origins"><label>Pedido externo<select value={origin?.kind === "orders" ? origin.id : ""} onChange={event => { if (event.target.value) void loadPayments({ kind: "orders", id: event.target.value }); else { setOrigin(null); setPayments([]); setAccountSession(null); } }}><option value="">Selecciona un pedido</option>{orders.map(order => <option key={order.id} value={order.id}>{order.codigoSeguimiento} · {order.estado}</option>)}</select></label><label>Cuenta de mesa<select value={origin?.kind === "accounts" ? origin.id : ""} onChange={event => { if (event.target.value) void loadPayments({ kind: "accounts", id: event.target.value }); else { setOrigin(null); setPayments([]); setAccountSession(null); } }}><option value="">Selecciona una cuenta</option>{tables.filter(row => row.cuentaId).map(row => <option key={row.cuentaId} value={row.cuentaId}>{row.identificador} · {row.estadoCuenta}</option>)}</select></label></div>
    {origin ? <section className="admin-session-detail"><h2>{origin.kind === "orders" ? "Pago del pedido" : "Pago de la cuenta"}</h2>{origin.kind === "accounts" && <section aria-labelledby="table-orders-heading"><h3 id="table-orders-heading">Pedidos de {accountSession?.mesa ?? tables.find(row => row.cuentaId === origin.id)?.identificador ?? "la mesa"}</h3><p>Los pedidos de mesa se cobran juntos desde su cuenta. Cada pedido se acepta por separado; los que sigan pendientes de confirmación todavía no se incluyen en el saldo.</p>{accountSessionLoading ? <p role="status">Consultando pedidos de la mesa…</p> : accountSession?.pedidos.length ? <div className="admin-order-list">{accountSession.pedidos.map(order => <article key={order.id} className="admin-order-card"><div><span className="admin-eyebrow">PEDIDO DE MESA · {order.estado}</span><h3>{order.codigoSeguimiento}</h3><p>{new Date(order.creadoEn).toLocaleString("es-CO")}</p></div><div className="admin-order-end"><strong>{money(order.total)}</strong></div></article>)}</div> : <p className="admin-empty">Esta cuenta todavía no tiene pedidos asociados.</p>}</section>}<form className="admin-manual-form" onSubmit={create}><label>Medio de pago<select value={method} onChange={event => setMethod(event.target.value)}><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option></select></label><button className="admin-primary-button" disabled={busy}>Crear intento por el saldo pendiente</button></form><h3>Intentos registrados</h3>{payments.length ? <div className="admin-order-list">{payments.map(payment => <article key={payment.id} className="admin-order-card"><div><span className="admin-eyebrow">{payment.metodo} · {payment.estado}</span><h3>{money(payment.importe)}</h3><p>{new Date(payment.creadoEn).toLocaleString("es-CO")}</p>{payment.motivoRechazo && <p>Motivo: {payment.motivoRechazo}</p>}</div><div className="admin-order-end"><div className="admin-table-actions">{payment.metodo === "EFECTIVO" && payment.estado === "PENDIENTE" && <button className="admin-fill" disabled={busy} onClick={() => void act(`/payments/${payment.id}/confirm-cash`, undefined, "Pago en efectivo confirmado.")}>Confirmar efectivo</button>}{payment.metodo === "TRANSFERENCIA" && payment.estado === "PENDIENTE_VERIFICACION" && <><button type="button" onClick={() => void download(payment.id)}>Comprobante</button><button disabled={busy} onClick={() => { setDecision({ id: payment.id, kind: "reject" }); setReason(""); }}>Rechazar</button><button className="admin-fill" disabled={busy} onClick={() => void act(`/payments/${payment.id}/verification`, { aprobar: true }, "Transferencia verificada.")}>Verificar</button></>}{payment.estado === "CONFIRMADO" && <button disabled={busy} onClick={() => { setDecision({ id: payment.id, kind: "refund" }); setReason(""); }}>Reembolso total</button>}</div>{payment.metodo === "TRANSFERENCIA" && payment.estado === "PENDIENTE" && <form className="admin-manual-form" onSubmit={event => upload(event, payment.id)}><label>Comprobante<input type="file" accept="image/jpeg,image/png,application/pdf" onChange={event => setFile(event.target.files?.[0] ?? null)} required /></label><button className="admin-primary-button" disabled={busy || !file}>Subir comprobante</button></form>}</div></article>)}</div> : <p className="admin-empty">Todavía no hay intentos de pago para este origen.</p>}{decision && <form className="admin-manual-form admin-operation-block" onSubmit={submitDecision}><h3>{decision.kind === "reject" ? "Rechazar transferencia" : "Registrar reembolso total"}</h3><label>Motivo<input value={reason} onChange={event => setReason(event.target.value)} required minLength={3} maxLength={240} /></label><div className="admin-table-actions"><button type="button" onClick={() => setDecision(null)}>Volver</button><button className="admin-fill" disabled={busy}>Confirmar</button></div></form>}</section> : <p className="admin-empty">Selecciona un pedido o una cuenta para ver sus pagos.</p>}
  </>;
}
