"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";

type Delivery = { id: string; estado: string; creadoEn: string; destinatario?: string; montoEfectivoDeclarado?: number };
type Reconciliation = { id: string; declarado: number; recibido: number; motivo?: string; fecha: string };
type Status = { registrada: boolean; conciliacion?: Reconciliation };
const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

export default function ReconciliationsPage() {
  const { staff, branchId } = useAdmin();
  const allowed = staff.roles.includes("ATENCION");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [received, setReceived] = useState(0);
  const [declared, setDeclared] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!allowed || !branchId) return;
    setLoading(true);
    try { setDeliveries(await api<Delivery[]>(`/staff/deliveries?sucursalId=${branchId}`)); setError(""); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron cargar las entregas."); }
    finally { setLoading(false); }
  }, [allowed, branchId]);
  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);

  const show = async (row: Delivery) => {
    setSelected(row); setError("");
    try {
      const next = await api<Status>(`/staff/deliveries/${row.id}/cash-reconciliation`);
      setStatus(next); setDeclared(next.conciliacion?.declarado ?? row.montoEfectivoDeclarado ?? 0);
      setReceived(next.conciliacion?.recibido ?? row.montoEfectivoDeclarado ?? 0); setReason("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo consultar la conciliación."); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!selected || !status) return;
    setBusy(true); setError(""); setNotice("");
    const rectification = status.registrada;
    try {
      const path = `/staff/deliveries/${selected.id}/cash-reconciliation${rectification ? "/rectification" : ""}`;
      await api(path, { method: "POST", body: JSON.stringify(rectification
        ? { montoDeclarado: declared, montoRecibido: received, motivo: reason.trim() }
        : { montoRecibido: received, motivo: reason.trim() || null }) });
      setNotice(rectification ? "Conciliación rectificada y auditada." : "Conciliación registrada.");
      await show(selected); await refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo registrar la conciliación."); }
    finally { setBusy(false); }
  };

  if (!allowed) return <p className="admin-message admin-message-error" role="alert">Tu rol no tiene acceso a las conciliaciones.</p>;
  const candidates = deliveries.filter(row => row.estado === "ENTREGADA" && row.montoEfectivoDeclarado != null);
  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">RECAUDO DE DOMICILIOS</span><h1>Efectivo <em>conciliado.</em></h1><p>Compara lo declarado por el repartidor con lo recibido en la sucursal. Toda diferencia exige motivo y las rectificaciones quedan auditadas.</p></div>
    <div className="admin-section-tools"><span>{candidates.length} entregas con efectivo declarado</span><button type="button" onClick={() => void refresh()} disabled={loading}>Actualizar</button></div>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    {loading && <p role="status">Cargando entregas…</p>}
    {candidates.length ? <div className="admin-order-list">{candidates.map(row => <article className="admin-order-card" key={row.id}><div><span className="admin-eyebrow">ENTREGADA</span><h3>{row.destinatario ?? "Domicilio"}</h3><p>Declarado: {money(row.montoEfectivoDeclarado ?? 0)} · {new Date(row.creadoEn).toLocaleString("es-CO")}</p></div><div className="admin-order-end"><button type="button" onClick={() => void show(row)}>Ver conciliación</button></div></article>)}</div> : !loading && <p className="admin-empty">No hay entregas con efectivo declarado.</p>}
    {selected && status && <section className="admin-session-detail"><h2>{status.registrada ? "Conciliación registrada" : "Nueva conciliación"}</h2>{status.conciliacion && <p>Último registro: {new Date(status.conciliacion.fecha).toLocaleString("es-CO")}{status.conciliacion.motivo && ` · ${status.conciliacion.motivo}`}</p>}<form className="admin-manual-form" onSubmit={submit}><div className="admin-form-grid"><label>Declarado por el repartidor<input type="number" min={0} step="0.01" value={declared} onChange={event => setDeclared(Number(event.target.value))} disabled={!status.registrada} /></label><label>Recibido por la sucursal<input type="number" min={0} step="0.01" value={received} onChange={event => setReceived(Number(event.target.value))} required /></label></div><label>Motivo {status.registrada || received !== declared ? "(obligatorio)" : "(opcional)"}<input value={reason} onChange={event => setReason(event.target.value)} required={status.registrada || received !== declared} minLength={3} maxLength={500} /></label><div className="admin-order-total">Diferencia <strong>{money(received - declared)}</strong></div><button className="admin-primary-button" disabled={busy}>{status.registrada ? "Registrar rectificación" : "Conciliar efectivo"}</button></form></section>}
  </>;
}
