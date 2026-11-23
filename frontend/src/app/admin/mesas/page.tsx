"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, RefreshCw, UtensilsCrossed } from "lucide-react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";

type Table = { id: string; identificador: string; identificadorQr: string; activa: boolean; sesionId?: string; estadoSesion?: string; cuentaId?: string; estadoCuenta?: string };
type Session = { sesionId: string; mesa: string; codigoQrMesa: string; estadoSesion: string; expiraEn: string; cuentaId: string; estadoCuenta: string; pedidos: { id: string; estado: string; total: number; codigoSeguimiento: string }[] };
type Opened = { sesionId: string; tokenTemporal: string; expiraEn: string; cuentaId: string; qrSvg: string };

export default function TablesPage() {
  const { staff, branchId, branches } = useAdmin();
  const canOperate = staff.roles.includes("ATENCION");
  const canManageTables = staff.roles.includes("ADMINISTRADOR");
  const [tables, setTables] = useState<Table[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [issued, setIssued] = useState<Opened | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tableIdentifier, setTableIdentifier] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!branchId) { setTables([]); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const path = canOperate ? `/tables?sucursalId=${encodeURIComponent(branchId)}` : `/admin/tables?sucursalId=${encodeURIComponent(branchId)}`;
      setTables(await api<Table[]>(path));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron consultar las mesas."); }
    finally { setLoading(false); }
  }, [branchId, canOperate]);

  useEffect(() => {
    if (!branchId) return;
    let live = true;
    const path = canOperate ? `/tables?sucursalId=${encodeURIComponent(branchId)}` : `/admin/tables?sucursalId=${encodeURIComponent(branchId)}`;
    api<Table[]>(path).then(rows => { if (live) setTables(rows); })
      .catch(failure => { if (live) setError(failure instanceof Error ? failure.message : "No se pudieron consultar las mesas."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [branchId, canOperate]);

  const show = async (table: Table) => {
    setIssued(null); setError("");
    if (!table.sesionId || !canOperate) { setSelected(null); return; }
    try { setSelected(await api<Session>(`/tables/sessions/${table.sesionId}`)); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo abrir la sesión."); }
  };

  const operate = async (path: string, message: string) => {
    setBusy(true); setError(""); setNotice("");
    try { await api<unknown>(path, { method: "POST" }); setSelected(null); setIssued(null); setNotice(message); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo completar la operación."); }
    finally { setBusy(false); }
  };

  const open = async (table: Table) => {
    setBusy(true); setError(""); setNotice("");
    try { const result = await api<Opened>(`/tables/${table.id}/sessions`, { method: "POST" }); setIssued(result); setSelected(await api<Session>(`/tables/sessions/${result.sesionId}`)); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo abrir la mesa."); }
    finally { setBusy(false); }
  };

  const createTable = async () => {
    if (!branchId || !tableIdentifier.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api<Table>("/admin/tables", {
        method: "POST",
        body: JSON.stringify({ sucursalId: branchId, identificador: tableIdentifier.trim() }),
      });
      setTableIdentifier("");
      setShowCreateForm(false);
      setNotice("Mesa creada correctamente.");
      await refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo crear la mesa.");
    } finally { setBusy(false); }
  };

  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">SALA · {branches.find(branch => branch.id === branchId)?.nombre ?? "SIN SUCURSAL"}</span><h1>Mesas <em>y sesiones.</em></h1><p>Consulta la ocupación, abre el acceso temporal y acompaña cada cuenta hasta su cierre.</p></div>
    <div className="admin-section-tools"><span>{tables.length} mesas</span><div className="admin-table-toolbar-actions">
      {canManageTables && <button className="admin-primary-button admin-table-create-trigger" type="button" onClick={() => { setShowCreateForm(value => !value); setError(""); setNotice(""); }} aria-expanded={showCreateForm} aria-controls="create-table-panel" disabled={!branchId}><Plus size={17} aria-hidden="true" /> Crear mesa</button>}
      <button type="button" onClick={() => void refresh()}><RefreshCw size={16} aria-hidden="true" /> Actualizar</button>
    </div></div>
    {canManageTables && showCreateForm && <section id="create-table-panel" className="admin-manual-order admin-table-create-panel" aria-labelledby="create-table-title">
      <h2 id="create-table-title">Nueva mesa</h2>
      <p className="admin-form-note">Se registrará en {branches.find(branch => branch.id === branchId)?.nombre ?? "la sucursal seleccionada"} y tendrá su propio código QR.</p>
      <form className="admin-manual-form admin-table-create-form" onSubmit={event => { event.preventDefault(); void createTable(); }}>
        <label htmlFor="table-identifier">Identificador de la mesa
          <input id="table-identifier" name="identificador" type="text" value={tableIdentifier} onChange={event => setTableIdentifier(event.target.value)} maxLength={40} required autoComplete="off" placeholder="Ej. Mesa 4" />
        </label>
        <div className="admin-table-create-actions">
          <button className="admin-primary-button" type="submit" disabled={busy || !branchId || !tableIdentifier.trim()}><Plus size={17} aria-hidden="true" /> {busy ? "Creando…" : "Crear mesa"}</button>
          <button type="button" onClick={() => { setShowCreateForm(false); setTableIdentifier(""); }} disabled={busy}>Cancelar</button>
        </div>
      </form>
    </section>}
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    {loading && branchId ? <p className="admin-empty">Consultando mesas…</p> : tables.length === 0 ? <p className="admin-empty">Todavía no hay mesas registradas en esta sucursal.</p> : <div className="admin-table-grid">{tables.map(table => <article className="admin-table-card" key={table.id}>
      <UtensilsCrossed size={24} aria-hidden="true" /><span className="admin-eyebrow">{table.activa ? "MESA ACTIVA" : "FUERA DE SERVICIO"}</span><h2>{table.identificador}</h2>
      <p>{table.estadoSesion === "ACTIVA" ? "Sesión abierta" : "Sin sesión activa"} · {table.estadoCuenta === "ABIERTA" ? "Cuenta abierta" : "Sin cuenta abierta"}</p>
      {canOperate && <div className="admin-table-actions">{table.sesionId && <button type="button" onClick={() => void show(table)}>Ver detalle <ArrowRight size={16} aria-hidden="true" /></button>}{table.activa && table.estadoSesion !== "ACTIVA" && table.estadoCuenta !== "ABIERTA" && <button className="admin-fill" disabled={busy} type="button" onClick={() => void open(table)}>Abrir sesión</button>}</div>}
    </article>)}</div>}
    {canOperate && selected && <section className="admin-session-detail" aria-labelledby="session-title"><div className="admin-section-tools"><h2 id="session-title">Mesa {selected.mesa}</h2><button onClick={() => { setSelected(null); setIssued(null); }} aria-label="Cerrar detalle">Cerrar ×</button></div><p>Sesión: {selected.estadoSesion} · Cuenta: {selected.estadoCuenta}</p><p>Acceso temporal hasta {new Date(selected.expiraEn).toLocaleString("es-CO")}</p>
      {issued?.sesionId === selected.sesionId && <div className="admin-token"><strong>Acceso temporal para esta mesa</strong><p>Muestra este QR al cliente presente en la mesa. Deja de funcionar al cerrar la sesión o al vencer su vigencia.</p><div className="admin-qr" dangerouslySetInnerHTML={{ __html: issued.qrSvg }} /><p>Se muestra una sola vez al abrir la sesión.</p><a className="admin-qr-order-link" href={`/mesa/${encodeURIComponent(selected.codigoQrMesa)}#t=${encodeURIComponent(issued.tokenTemporal)}`} target="_blank" rel="noopener noreferrer">Abrir pedidos de esta mesa <ArrowRight size={16} aria-hidden="true" /></a></div>}
      <h3>Pedidos de esta cuenta</h3>{selected.pedidos.length === 0 ? <p>Aún no hay pedidos.</p> : <ul>{selected.pedidos.map(order => <li key={order.id}>{order.codigoSeguimiento} · {order.estado} · {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(order.total)}</li>)}</ul>}
      <div className="admin-table-actions">{selected.estadoSesion === "ACTIVA" && <button disabled={busy} onClick={() => void operate(`/tables/sessions/${selected.sesionId}/close`, "Sesión cerrada.")}>Cerrar sesión</button>}{selected.estadoCuenta === "ABIERTA" && <button disabled={busy} onClick={() => void operate(`/tables/accounts/${selected.cuentaId}/close`, "Cuenta cerrada.")}>Cerrar cuenta</button>}</div>
    </section>}
  </>;
}
