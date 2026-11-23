"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api, type Branch } from "@/lib/api";

type Product = { id: string; nombre: string };
type RequestLine = { id: string; productoId: string; solicitada: number; aprobada?: number; enviada: number; pendienteEnvio: number; faltanteCerrado?: number; reversaCierreEn?: string };
type Request = { id: string; sucursalSolicitanteId: string; sucursalProveedoraId: string; estado: string; fecha: string; items: RequestLine[] };
type DispatchLine = { id: string; detalleSolicitudId: string; enviada: number; recibida: number; pendienteRecepcion: number; faltanteCerrado?: number; reversaCierreEn?: string };
type Dispatch = { id: string; solicitudId: string; fecha: string; anulado: boolean; motivoAnulacion?: string; items: DispatchLine[] };
type Receipt = { id: string; despachoId: string; fecha: string; anulado: boolean; items: { id: string; detalleDespachoId: string; aptas: number; danadas: number }[] };
type Detail = { solicitud: Request; despachos: Dispatch[]; recepciones: Receipt[] };
type Action = { path: string; title: string };
const date = (value: string) => new Date(value).toLocaleString("es-CO");

export default function ReplenishmentsPage() {
  const { staff, branchId, branches } = useAdmin();
  const allowed = staff.roles.includes("INVENTARIO");
  const currentBranch = branches.find(branch => branch.id === branchId);
  const principal = currentBranch?.tipo === "PRINCIPAL";
  const [requests, setRequests] = useState<Request[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [newItems, setNewItems] = useState<{ productoId: string; cantidad: number }[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [values, setValues] = useState<Record<string, number>>({});
  const [damaged, setDamaged] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!allowed || !branchId || !currentBranch) return;
    setLoading(true);
    try {
      const path = principal ? `/replenishments/provided?sucursalId=${branchId}` : `/replenishments?sucursalId=${branchId}`;
      const [rows, catalog, locations] = await Promise.all([api<Request[]>(path), api<Product[]>("/catalog/products"), api<Branch[]>("/branches")]);
      setRequests(rows); setProducts(catalog); setAllBranches(locations); setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron consultar las reposiciones."); }
    finally { setLoading(false); }
  }, [allowed, branchId, currentBranch, principal]);

  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);

  const show = async (id: string) => {
    setError("");
    try {
      const detail = await api<Detail>(`/replenishments/${id}`);
      setSelected(detail); setValues({}); setDamaged({}); setAction(null); setReason("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo consultar la solicitud."); }
  };

  const send = async (path: string, body: object, message: string) => {
    setBusy(true); setError(""); setNotice("");
    try {
      await api(path, { method: "POST", body: JSON.stringify(body) });
      setNotice(message); setAction(null); setReason(""); await refresh();
      if (selected) await show(selected.solicitud.id);
      return true;
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo completar la operación."); }
    finally { setBusy(false); }
    return false;
  };

  const create = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const provider = allBranches.find(branch => branch.tipo === "PRINCIPAL");
    if (!provider || !branchId || !newItems.length) { setError("Agrega productos y comprueba que haya una sede principal disponible."); return; }
    void send("/replenishments", { sucursalSolicitanteId: branchId, sucursalProveedoraId: provider.id, observaciones: reason.trim() || null, items: newItems }, "Solicitud de reposición creada.").then(success => { if (success) setNewItems([]); });
  };

  const addProduct = () => {
    if (!productId || quantity < 1) return;
    setNewItems(current => current.some(row => row.productoId === productId)
      ? current.map(row => row.productoId === productId ? { ...row, cantidad: row.cantidad + quantity } : row)
      : [...current, { productoId: productId, cantidad: quantity }]);
    setProductId(""); setQuantity(1);
  };

  const name = (id: string) => products.find(product => product.id === id)?.nombre ?? `Producto ${id.slice(0, 8)}`;
  const branchName = (id: string) => allBranches.find(branch => branch.id === id)?.nombre ?? "otra sucursal";
  const lineName = (id: string) => name(selected?.solicitud.items.find(line => line.id === id)?.productoId ?? "");
  const handleReason = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (action && reason.trim()) void send(action.path, { motivo: reason.trim() }, `${action.title} registrada.`); };

  if (!allowed) return <p className="admin-message admin-message-error" role="alert">Tu rol no tiene acceso a las reposiciones.</p>;
  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">INVENTARIO ENTRE SEDES</span><h1>Reposiciones <em>con registro.</em></h1><p>Las solicitudes, despachos y recepciones parciales conservan su historial. Java valida cantidades, existencias y permisos.</p></div>
    <div className="admin-section-tools"><span>{currentBranch?.nombre ?? "Selecciona una sucursal"}</span><button type="button" onClick={() => void refresh()} disabled={loading}>Actualizar</button></div>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    {loading && <p role="status">Cargando reposiciones…</p>}
    {!principal && <section className="admin-manual-order"><h2>Nueva solicitud</h2><form className="admin-manual-form" onSubmit={create}><div className="admin-product-picker"><label>Producto<select value={productId} onChange={event => setProductId(event.target.value)}><option value="">Selecciona uno</option>{products.map(product => <option key={product.id} value={product.id}>{product.nombre}</option>)}</select></label><label>Cantidad<input type="number" min={1} value={quantity} onChange={event => setQuantity(Number(event.target.value))} /></label><button type="button" onClick={addProduct}>Añadir</button></div>{newItems.length ? <ul className="admin-manual-lines">{newItems.map(row => <li key={row.productoId}>{row.cantidad} × {name(row.productoId)}<button type="button" onClick={() => setNewItems(current => current.filter(item => item.productoId !== row.productoId))}>Quitar</button></li>)}</ul> : <p className="admin-empty">Selecciona los productos que necesitas.</p>}<label>Observaciones (opcional)<input value={reason} onChange={event => setReason(event.target.value)} maxLength={500} /></label><button className="admin-primary-button" disabled={busy || !newItems.length}>Solicitar reposición</button></form></section>}
    <section className="admin-dashboard-section"><h2>{principal ? "Solicitudes recibidas" : "Solicitudes de esta sede"}</h2>{requests.length ? <div className="admin-order-list">{requests.map(row => <article className="admin-order-card" key={row.id}><div><span className="admin-eyebrow">{row.estado}</span><h3>{branchName(row.sucursalSolicitanteId)} → {branchName(row.sucursalProveedoraId)}</h3><p>{date(row.fecha)} · {row.items.length} producto(s)</p></div><div className="admin-order-end"><button type="button" onClick={() => void show(row.id)}>Ver operación</button></div></article>)}</div> : !loading && <p className="admin-empty">No hay solicitudes de reposición para esta sede.</p>}</section>
    {selected && <section className="admin-session-detail" aria-labelledby="replenishment-title"><div className="admin-section-tools"><h2 id="replenishment-title">Solicitud · {selected.solicitud.estado}</h2><button type="button" onClick={() => setSelected(null)}>Cerrar</button></div><p>{branchName(selected.solicitud.sucursalSolicitanteId)} → {branchName(selected.solicitud.sucursalProveedoraId)} · {date(selected.solicitud.fecha)}</p><ul className="admin-movement-list">{selected.solicitud.items.map(line => <li key={line.id}><div><strong>{name(line.productoId)}</strong><small>Solicitado {line.solicitada} · Aprobado {line.aprobada ?? "sin revisar"} · Enviado {line.enviada} · Pendiente {line.pendienteEnvio}</small></div></li>)}</ul>
      {principal && selected.solicitud.estado === "PENDIENTE_REVISION" && <div className="admin-operation-block"><h3>Revisar solicitud</h3><div className="admin-form-grid">{selected.solicitud.items.map(line => <label key={line.id}>{name(line.productoId)} · máximo {line.solicitada}<input type="number" min={1} max={line.solicitada} value={values[line.id] ?? line.solicitada} onChange={event => setValues(current => ({ ...current, [line.id]: Number(event.target.value) }))} /></label>)}</div><div className="admin-table-actions"><button type="button" onClick={() => setAction({ path: `/replenishments/${selected.solicitud.id}/review`, title: "Rechazo" })}>Rechazar</button><button className="admin-fill" disabled={busy} onClick={() => void send(`/replenishments/${selected.solicitud.id}/review`, { aprobar: true, cantidadesAprobadas: Object.fromEntries(selected.solicitud.items.map(line => [line.id, values[line.id] ?? line.solicitada])) }, "Solicitud aprobada.")}>Aprobar cantidades</button></div></div>}
      {principal && selected.solicitud.estado === "EN_PROCESO" && <div className="admin-operation-block"><h3>Despacho parcial</h3><div className="admin-form-grid">{selected.solicitud.items.filter(line => line.pendienteEnvio > 0).map(line => <label key={line.id}>{name(line.productoId)} · pendiente {line.pendienteEnvio}<input type="number" min={0} max={line.pendienteEnvio} value={values[line.id] ?? 0} onChange={event => setValues(current => ({ ...current, [line.id]: Number(event.target.value) }))} /></label>)}</div><button className="admin-primary-button" type="button" disabled={busy || !selected.solicitud.items.some(line => (values[line.id] ?? 0) > 0)} onClick={() => void send(`/replenishments/${selected.solicitud.id}/dispatch`, { observaciones: null, items: selected.solicitud.items.filter(line => (values[line.id] ?? 0) > 0).map(line => ({ detalleSolicitudId: line.id, cantidad: values[line.id] })) }, "Despacho registrado.")}>Registrar despacho</button></div>}
      {selected.despachos.map(dispatch => <div key={dispatch.id} className="admin-operation-block"><h3>Despacho · {date(dispatch.fecha)} {dispatch.anulado && "· Anulado"}</h3><ul className="admin-movement-list">{dispatch.items.map(line => <li key={line.id}><span>{lineName(line.detalleSolicitudId)} · enviadas {line.enviada} · recibidas {line.recibida} · pendientes {line.pendienteRecepcion}</span>{!principal && !dispatch.anulado && line.pendienteRecepcion > 0 && <button type="button" onClick={() => setAction({ path: `/replenishments/dispatch-lines/${line.id}/close-after-dispatch`, title: "Cierre de faltante" })}>Cerrar faltante</button>}{!principal && !dispatch.anulado && line.faltanteCerrado && !line.reversaCierreEn && <button type="button" onClick={() => setAction({ path: `/replenishments/dispatch-lines/${line.id}/reverse-closure`, title: "Reversa de cierre" })}>Revertir cierre</button>}</li>)}</ul>{!principal && !dispatch.anulado && dispatch.items.some(line => line.pendienteRecepcion > 0) && <div className="admin-manual-form"><h3>Registrar recepción</h3>{dispatch.items.filter(line => line.pendienteRecepcion > 0).map(line => <div className="admin-form-grid" key={line.id}><label>{lineName(line.detalleSolicitudId)} · aptas<input type="number" min={0} max={line.pendienteRecepcion} value={values[line.id] ?? 0} onChange={event => setValues(current => ({ ...current, [line.id]: Number(event.target.value) }))} /></label><label>Dañadas<input type="number" min={0} max={line.pendienteRecepcion} value={damaged[line.id] ?? 0} onChange={event => setDamaged(current => ({ ...current, [line.id]: Number(event.target.value) }))} /></label></div>)}<button className="admin-primary-button" type="button" disabled={busy || !dispatch.items.some(line => (values[line.id] ?? 0) + (damaged[line.id] ?? 0) > 0)} onClick={() => void send(`/replenishments/dispatches/${dispatch.id}/receive`, { observaciones: null, items: dispatch.items.filter(line => (values[line.id] ?? 0) + (damaged[line.id] ?? 0) > 0).map(line => ({ detalleDespachoId: line.id, cantidadApta: values[line.id] ?? 0, cantidadDanada: damaged[line.id] ?? 0 })) }, "Recepción registrada.")}>Registrar recepción</button></div>}{principal && !dispatch.anulado && <button type="button" onClick={() => setAction({ path: `/replenishments/dispatches/${dispatch.id}/annul`, title: "Anulación de despacho" })}>Solicitar anulación del despacho</button>}</div>)}
      {principal && selected.solicitud.estado === "EN_PROCESO" && selected.solicitud.items.filter(line => line.pendienteEnvio > 0 || (line.faltanteCerrado && !line.reversaCierreEn)).map(line => <div className="admin-table-actions" key={line.id}><span>{name(line.productoId)} · pendiente {line.pendienteEnvio}</span>{line.pendienteEnvio > 0 && <button type="button" onClick={() => setAction({ path: `/replenishments/request-lines/${line.id}/close-before-dispatch`, title: "Cierre de faltante" })}>Cerrar faltante</button>}{line.faltanteCerrado && !line.reversaCierreEn && <button type="button" onClick={() => setAction({ path: `/replenishments/request-lines/${line.id}/reverse-closure`, title: "Reversa de cierre" })}>Revertir cierre</button>}</div>)}
      {selected.recepciones.length > 0 && <div className="admin-operation-block"><h3>Recepciones</h3>{selected.recepciones.map(receipt => <div className="admin-table-actions" key={receipt.id}><span>{date(receipt.fecha)} · aptas {receipt.items.reduce((sum, line) => sum + line.aptas, 0)} · dañadas {receipt.items.reduce((sum, line) => sum + line.danadas, 0)} {receipt.anulado && "· Anulada"}</span>{!principal && !receipt.anulado && <button type="button" onClick={() => setAction({ path: `/replenishments/receipts/${receipt.id}/annul`, title: "Anulación de recepción" })}>Anular</button>}</div>)}</div>}
      {action && <form className="admin-manual-form admin-operation-block" onSubmit={action.path.endsWith("/review") ? event => { event.preventDefault(); if (reason.trim()) void send(action.path, { aprobar: false, motivo: reason.trim() }, "Solicitud rechazada."); } : handleReason}><h3>{action.title}</h3><label>Motivo<input value={reason} onChange={event => setReason(event.target.value)} required minLength={3} maxLength={500} autoFocus /></label><div className="admin-table-actions"><button type="button" onClick={() => setAction(null)}>Volver</button><button className="admin-fill" disabled={busy}>Confirmar</button></div></form>}
    </section>}
  </>;
}
