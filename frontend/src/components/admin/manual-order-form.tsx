"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";

type Product = { id: string; nombre: string; precio: number };
type Line = { productoId: string; cantidad: number };
type Created = { codigoSeguimiento: string };
const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

export function ManualOrderForm({ branchId, onCreated }: { branchId: string; onCreated: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<Line[]>([]);
  const [mode, setMode] = useState<"RECOGER" | "DOMICILIO">("RECOGER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let live = true;
    queueMicrotask(() => { if (live) setLoading(true); });
    api<Product[]>("/catalog/products")
      .then(rows => { if (live) { setProducts(rows); setError(""); } })
      .catch(failure => { if (live) setError(failure instanceof Error ? failure.message : "No se pudo cargar el catálogo."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [open]);

  const add = () => {
    if (!productId || quantity < 1 || quantity > 100) return;
    setItems(current => {
      const existing = current.find(line => line.productoId === productId);
      if (existing) return current.map(line => line.productoId === productId ? { ...line, cantidad: Math.min(100, line.cantidad + quantity) } : line);
      return [...current, { productoId: productId, cantidad: quantity }];
    });
    setQuantity(1);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!branchId || items.length === 0) { setError("Agrega al menos un producto y selecciona una sucursal."); return; }
    setSaving(true); setError("");
    try {
      const result = await api<Created>("/staff/orders/whatsapp", {
        method: "POST",
        body: JSON.stringify({ modalidad: mode, sucursalId: branchId, nombre: name.trim(), telefono: phone.trim(),
          direccion: mode === "DOMICILIO" ? address.trim() : null, barrio: mode === "DOMICILIO" ? district.trim() : null,
          referencia: mode === "DOMICILIO" ? reference.trim() : null, ubicacionConsentida: false, items }),
      });
      setItems([]); setName(""); setPhone(""); setAddress(""); setDistrict(""); setReference(""); setOpen(false);
      onCreated(result.codigoSeguimiento);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo registrar el pedido."); }
    finally { setSaving(false); }
  };

  const subtotal = items.reduce((total, line) => total + (products.find(product => product.id === line.productoId)?.precio ?? 0) * line.cantidad, 0);

  return <section className="admin-manual-order" aria-labelledby="manual-order-heading">
    <div className="admin-section-tools"><div><h2 id="manual-order-heading">Pedido recibido por WhatsApp</h2><p>Regístralo aquí para incorporarlo a la cola de atención.</p></div><button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}>{open ? "Cerrar" : "Registrar pedido"}</button></div>
    {open && <form onSubmit={submit} className="admin-manual-form">
      {loading && <p role="status">Cargando productos…</p>}
      {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
      <div className="admin-form-grid"><label>Nombre del cliente<input value={name} onChange={event => setName(event.target.value)} maxLength={160} required /></label><label>Teléfono<input type="tel" value={phone} onChange={event => setPhone(event.target.value)} pattern="[+0-9][0-9 +()\-]{5,29}" required /></label></div>
      <fieldset className="admin-mode-options"><legend>Entrega</legend><label><input type="radio" name="delivery-mode" checked={mode === "RECOGER"} onChange={() => setMode("RECOGER")} /> Recoger en la sucursal seleccionada</label><label><input type="radio" name="delivery-mode" checked={mode === "DOMICILIO"} onChange={() => setMode("DOMICILIO")} /> Domicilio</label></fieldset>
      {mode === "DOMICILIO" && <div className="admin-form-grid"><label>Dirección<input value={address} onChange={event => setAddress(event.target.value)} maxLength={240} required /></label><label>Barrio<input value={district} onChange={event => setDistrict(event.target.value)} maxLength={120} required /></label><label>Referencia (opcional)<input value={reference} onChange={event => setReference(event.target.value)} maxLength={240} /></label></div>}
      <div className="admin-product-picker"><label>Producto<select value={productId} onChange={event => setProductId(event.target.value)} disabled={loading || !products.length}><option value="">Selecciona uno</option>{products.map(product => <option key={product.id} value={product.id}>{product.nombre} · {money(product.precio)}</option>)}</select></label><label>Cantidad<input type="number" min={1} max={100} value={quantity} onChange={event => setQuantity(Number(event.target.value))} /></label><button type="button" onClick={add} disabled={!productId || loading}>Agregar producto</button></div>
      {items.length ? <ul className="admin-manual-lines">{items.map(line => { const product = products.find(row => row.id === line.productoId); return <li key={line.productoId}><span>{line.cantidad} × {product?.nombre ?? "Producto"}</span><strong>{money((product?.precio ?? 0) * line.cantidad)}</strong><button type="button" onClick={() => setItems(current => current.filter(row => row.productoId !== line.productoId))} aria-label={`Quitar ${product?.nombre ?? "producto"}`}>Quitar</button></li>; })}</ul> : <p className="admin-empty">Aún no agregas productos.</p>}
      <div className="admin-order-total">Subtotal <strong>{money(subtotal)}</strong></div>
      <p className="admin-form-note">Java calcula el valor final y comprueba la disponibilidad de la sucursal.</p>
      <button className="admin-primary-button" type="submit" disabled={saving || loading || !items.length || !branchId}>{saving ? "Registrando…" : "Registrar en la cola"}</button>
    </form>}
  </section>;
}
