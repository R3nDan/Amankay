"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";

type Stock = { id: string; sucursalId: string; productoId: string; disponible: number; actualizadoEn: string };
type Product = { id: string; nombre: string; precio: number };
type Movement = { id: string; tipo: string; cantidad: number; stockAnterior: number; stockResultante: number; fecha: string; motivo: string; movimientoCompensadoId?: string };
const date = (value: string) => new Date(value).toLocaleString("es-CO");

export default function InventoryPage() {
  const { staff, branchId, branches } = useAdmin();
  const allowed = staff.roles.includes("INVENTARIO");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Stock | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [adjustType, setAdjustType] = useState("AJUSTE_POSITIVO");
  const [compensationId, setCompensationId] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!allowed || !branchId) return;
    setLoading(true);
    try {
      const [rows, catalog] = await Promise.all([api<Stock[]>(`/inventory?sucursalId=${encodeURIComponent(branchId)}`), api<Product[]>("/catalog/products")]);
      setStocks(rows); setProducts(catalog); setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo cargar el inventario."); }
    finally { setLoading(false); }
  }, [allowed, branchId]);

  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);

  const showHistory = async (stock: Stock) => {
    setSelected(stock); setError("");
    try { setMovements(await api<Movement[]>(`/inventory/${stock.id}/movements`)); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron cargar los movimientos."); }
  };

  const initial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!branchId || !productId || !reason.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api("/inventory/initial", { method: "POST", body: JSON.stringify({ sucursalId: branchId, productoId: productId, cantidad: quantity, motivo: reason.trim() }) });
      setNotice("Existencia inicial registrada."); setProductId(""); setQuantity(1); setReason(""); await refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo registrar la existencia."); }
    finally { setBusy(false); }
  };

  const adjust = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!selected || !reason.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api(`/inventory/${selected.id}/adjustments`, { method: "POST", body: JSON.stringify({ tipo: adjustType, cantidad: quantity, motivo: reason.trim() }) });
      setNotice("Movimiento registrado."); setQuantity(1); setReason(""); await refresh(); await showHistory(selected);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo registrar el ajuste."); }
    finally { setBusy(false); }
  };

  const compensate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!selected || !compensationId || !reason.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await api(`/inventory/movements/${compensationId}/compensation`, { method: "POST", body: JSON.stringify({ motivo: reason.trim() }) });
      setNotice("Compensación total registrada; el movimiento original permanece en el historial.");
      setCompensationId(""); setReason(""); await refresh(); await showHistory(selected);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo compensar el movimiento."); }
    finally { setBusy(false); }
  };

  if (!allowed) return <p className="admin-message admin-message-error" role="alert">Tu rol no tiene acceso al inventario.</p>;
  const available = products.filter(product => !stocks.some(stock => stock.productoId === product.id));
  const productName = (id: string) => products.find(product => product.id === id)?.nombre ?? `Producto ${id.slice(0, 8)}`;
  const branch = branches.find(row => row.id === branchId)?.nombre ?? "la sucursal";

  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">EXISTENCIAS · {branch.toUpperCase()}</span><h1>Inventario <em>trazable.</em></h1><p>Consulta el saldo de cada producto y registra movimientos con motivo. Java valida la sucursal y conserva el historial.</p></div>
    <div className="admin-section-tools"><span>{stocks.length} productos con saldo registrado</span><button onClick={() => void refresh()} disabled={loading}><RefreshCw size={16} aria-hidden="true" /> Actualizar</button></div>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    {loading && <p role="status">Cargando inventario…</p>}
    <div className="admin-management-layout admin-inventory-layout">
      <section className="admin-manual-order"><h2>Existencia inicial</h2><p className="admin-form-note">Solo para productos que aún no tienen saldo en esta sucursal.</p><form className="admin-manual-form" onSubmit={initial}><div className="admin-form-grid"><label>Producto<select value={productId} onChange={event => setProductId(event.target.value)} required><option value="">Selecciona uno</option>{available.map(product => <option key={product.id} value={product.id}>{product.nombre}</option>)}</select></label><label>Cantidad<input type="number" min={1} value={quantity} onChange={event => setQuantity(Number(event.target.value))} required /></label></div><label>Motivo<input value={reason} onChange={event => setReason(event.target.value)} minLength={3} maxLength={240} required /></label><button className="admin-primary-button admin-initial-stock-submit" disabled={busy || !available.length}>Registrar existencia</button></form></section>
      <section className="admin-dashboard-section"><h2>Productos de la sucursal</h2>{stocks.length ? <div className="admin-stock-grid">{stocks.map(stock => <button type="button" key={stock.id} className="admin-stock-card" aria-pressed={selected?.id === stock.id} onClick={() => void showHistory(stock)}><strong>{productName(stock.productoId)}</strong><span>{stock.disponible} unidades</span><small>Actualizado {date(stock.actualizadoEn)}</small></button>)}</div> : !loading && <p className="admin-empty">Todavía no hay existencias registradas en esta sucursal.</p>}</section>
    </div>
    {selected && <section className="admin-session-detail" aria-labelledby="stock-title"><div className="admin-section-tools"><h2 id="stock-title">{productName(selected.productoId)}</h2><button type="button" onClick={() => { setSelected(null); setMovements([]); }}>Cerrar</button></div><p>Saldo actual: {stocks.find(row => row.id === selected.id)?.disponible ?? selected.disponible} unidades</p><form className="admin-manual-form" onSubmit={adjust}><h3>Registrar ajuste o merma</h3><div className="admin-form-grid"><label>Operación<select value={adjustType} onChange={event => setAdjustType(event.target.value)}><option value="AJUSTE_POSITIVO">Ajuste positivo</option><option value="AJUSTE_NEGATIVO">Ajuste negativo</option><option value="MERMA">Merma</option></select></label><label>Cantidad<input type="number" min={1} value={quantity} onChange={event => setQuantity(Number(event.target.value))} required /></label></div><label>Motivo<input value={reason} onChange={event => setReason(event.target.value)} minLength={3} maxLength={240} required /></label><button className="admin-primary-button" disabled={busy}>Registrar movimiento</button></form><h3>Historial de movimientos</h3>{movements.length ? <ul className="admin-movement-list">{movements.map(row => <li key={row.id}><div><strong>{row.tipo.replaceAll("_", " ")}</strong><small>{date(row.fecha)} · {row.motivo}</small></div><span>{row.stockAnterior} → {row.stockResultante}</span>{row.tipo !== "COMPENSACION" && !movements.some(other => other.movimientoCompensadoId === row.id) && <button type="button" onClick={() => setCompensationId(row.id)}>Compensar</button>}</li>)}</ul> : <p className="admin-empty">No hay movimientos registrados.</p>}{compensationId && <form className="admin-manual-form" onSubmit={compensate}><h3>Compensación total</h3><p>Se creará un movimiento nuevo. Java comprueba que solo se compense una vez y que no se encadenen compensaciones.</p><label>Motivo<input value={reason} onChange={event => setReason(event.target.value)} minLength={3} maxLength={240} required /></label><div className="admin-table-actions"><button type="button" onClick={() => setCompensationId("")}>Volver</button><button className="admin-fill" disabled={busy}>Confirmar compensación</button></div></form>}</section>}
  </>;
}
