"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";

type Category = { id: string; nombre: string; descripcion?: string; activa: boolean };
type Product = { id: string; categoriaId: string; nombre: string; descripcion?: string; imagen?: string; precio: number; activo: boolean };
const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

export default function CatalogAdminPage() {
  const { staff } = useAdmin();
  const allowed = staff.roles.includes("ADMINISTRADOR");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [productId, setProductId] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    try {
      const [categoryRows, productRows] = await Promise.all([api<Category[]>("/admin/categories"), api<Product[]>("/admin/products")]);
      setCategories(categoryRows); setProducts(productRows); setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo cargar el catálogo administrativo."); }
    finally { setLoading(false); }
  }, [allowed]);
  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);

  const change = async (path: string, method: "POST" | "PUT" | "PATCH", body: object | undefined, message: string) => {
    setBusy(true); setError(""); setNotice("");
    try {
      await api(path, { method, body: body ? JSON.stringify(body) : undefined });
      setNotice(message); await refresh(); return true;
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo guardar el cambio."); return false; }
    finally { setBusy(false); }
  };
  const clearCategory = () => { setCategoryId(""); setCategoryName(""); setCategoryDescription(""); };
  const clearProduct = () => { setProductId(""); setProductCategoryId(""); setProductName(""); setProductDescription(""); setProductImage(""); setProductPrice(0); };
  const saveCategory = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void change(categoryId ? `/admin/categories/${categoryId}` : "/admin/categories", categoryId ? "PUT" : "POST", { nombre: categoryName.trim(), descripcion: categoryDescription.trim() || null }, "Categoría guardada.").then(success => { if (success) clearCategory(); }); };
  const saveProduct = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void change(productId ? `/admin/products/${productId}` : "/admin/products", productId ? "PUT" : "POST", { categoriaId: productCategoryId, nombre: productName.trim(), descripcion: productDescription.trim() || null, imagen: productImage.trim() || null, precio: productPrice }, "Producto y precio guardados.").then(success => { if (success) clearProduct(); }); };
  if (!allowed) return <p className="admin-message admin-message-error" role="alert">Tu rol no tiene acceso a la administración del catálogo.</p>;
  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">ADMINISTRACIÓN DEL MENÚ</span><h1>Catálogo <em>con identidad.</em></h1><p>Organiza productos, categorías y precios. Los cambios los valida y persiste Java.</p></div>
    <div className="admin-section-tools"><span>{products.filter(row => row.activo).length} productos activos</span><button type="button" onClick={() => void refresh()} disabled={loading}>Actualizar</button></div>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    {loading && <p role="status">Cargando catálogo…</p>}
    <div className="admin-management-layout admin-catalog-layout">
      <section className="admin-manual-order"><h2>Categorías</h2><form className="admin-manual-form" onSubmit={saveCategory}><div className="admin-form-grid"><label>Nombre<input value={categoryName} onChange={event => setCategoryName(event.target.value)} maxLength={100} required /></label><label>Descripción<input value={categoryDescription} onChange={event => setCategoryDescription(event.target.value)} maxLength={300} /></label></div><div className="admin-table-actions"><button className="admin-fill" disabled={busy}>{categoryId ? "Guardar cambios" : "Crear categoría"}</button>{categoryId && <button type="button" onClick={clearCategory}>Cancelar edición</button>}</div></form><div className="admin-order-list">{categories.map(row => <article className="admin-order-card" key={row.id}><div><span className="admin-eyebrow">{row.activa ? "ACTIVA" : "INACTIVA"}</span><h3>{row.nombre}</h3><p>{row.descripcion}</p></div><div className="admin-order-end"><div className="admin-table-actions"><button type="button" onClick={() => { setCategoryId(row.id); setCategoryName(row.nombre); setCategoryDescription(row.descripcion ?? ""); }}>Editar</button><button type="button" disabled={busy} onClick={() => void change(`/admin/categories/${row.id}/${row.activa ? "deactivate" : "activate"}`, "PATCH", undefined, "Estado de la categoría actualizado.")}>{row.activa ? "Desactivar" : "Activar"}</button></div></div></article>)}</div>{!categories.length && !loading && <p className="admin-empty">No hay categorías registradas.</p>}</section>
      <section className="admin-manual-order"><h2>Productos y precios</h2><form className="admin-manual-form" onSubmit={saveProduct}><div className="admin-form-grid"><label>Categoría<select value={productCategoryId} onChange={event => setProductCategoryId(event.target.value)} required><option value="">Selecciona una categoría activa</option>{categories.filter(row => row.activa).map(row => <option key={row.id} value={row.id}>{row.nombre}</option>)}</select></label><label>Nombre<input value={productName} onChange={event => setProductName(event.target.value)} maxLength={120} required /></label><label>Precio en COP<input type="number" min={0} step="0.01" value={productPrice} onChange={event => setProductPrice(Number(event.target.value))} required /></label><label>Ruta de imagen<input value={productImage} onChange={event => setProductImage(event.target.value)} maxLength={500} placeholder="/imagenes/productos/..." /></label></div><label>Descripción<input value={productDescription} onChange={event => setProductDescription(event.target.value)} maxLength={500} /></label><div className="admin-table-actions"><button className="admin-fill" disabled={busy}>{productId ? "Guardar producto" : "Crear producto"}</button>{productId && <button type="button" onClick={clearProduct}>Cancelar edición</button>}</div></form><div className="admin-order-list">{products.map(row => <article className="admin-order-card" key={row.id}><div><span className="admin-eyebrow">{categories.find(category => category.id === row.categoriaId)?.nombre ?? "Categoría"} · {row.activo ? "ACTIVO" : "INACTIVO"}</span><h3>{row.nombre}</h3><p>{row.descripcion}</p></div><div className="admin-order-end"><strong>{money(row.precio)}</strong><div className="admin-table-actions"><button type="button" onClick={() => { setProductId(row.id); setProductCategoryId(row.categoriaId); setProductName(row.nombre); setProductDescription(row.descripcion ?? ""); setProductImage(row.imagen ?? ""); setProductPrice(row.precio); }}>Editar</button><button type="button" disabled={busy} onClick={() => void change(`/admin/products/${row.id}/${row.activo ? "deactivate" : "activate"}`, "PATCH", undefined, "Estado del producto actualizado.")}>{row.activo ? "Desactivar" : "Activar"}</button></div></div></article>)}</div>{!products.length && !loading && <p className="admin-empty">No hay productos registrados.</p>}</section>
    </div>
  </>;
}
