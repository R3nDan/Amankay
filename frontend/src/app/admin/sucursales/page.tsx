"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api } from "@/lib/api";

type Schedule = { dia: string; apertura: string; cierre: string; abierto: boolean };
type Branch = { id: string; nombre: string; direccion: string; telefono: string; tipo: "PRINCIPAL" | "SECUNDARIA"; activa: boolean; latitud?: number; longitud?: number; horarios: Schedule[] };
type DeliveryConfig = { tarifa: number; cobertura: string };
const days = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

export default function BranchesAdminPage() {
  const { staff } = useAdmin();
  const allowed = staff.roles.includes("ADMINISTRADOR");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [delivery, setDelivery] = useState<DeliveryConfig | null>(null);
  const [selected, setSelected] = useState<Branch | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"PRINCIPAL" | "SECUNDARIA">("SECUNDARIA");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [fee, setFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    try { const [rows, config] = await Promise.all([api<Branch[]>("/admin/branches"), api<DeliveryConfig>("/delivery/config")]); setBranches(rows); setDelivery(config); setFee(config.tarifa); setError(""); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo cargar la configuración."); }
    finally { setLoading(false); }
  }, [allowed]);
  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);

  const clear = () => { setSelected(null); setName(""); setAddress(""); setPhone(""); setType("SECUNDARIA"); setLat(""); setLon(""); setSchedules([]); };
  const edit = (row: Branch) => { setSelected(row); setName(row.nombre); setAddress(row.direccion); setPhone(row.telefono ?? ""); setType(row.tipo); setLat(row.latitud == null ? "" : String(row.latitud)); setLon(row.longitud == null ? "" : String(row.longitud)); setSchedules(days.map(day => row.horarios.find(schedule => schedule.dia === day) ?? { dia: day, apertura: "06:30", cierre: "18:30", abierto: false })); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      await api(selected ? `/admin/branches/${selected.id}` : "/admin/branches", { method: selected ? "PUT" : "POST", body: JSON.stringify({ nombre: name.trim(), direccion: address.trim(), telefono: phone.trim() || null, tipo: type, latitud: lat ? Number(lat) : null, longitud: lon ? Number(lon) : null }) });
      setNotice("Sucursal guardada."); clear(); await refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo guardar la sucursal."); }
    finally { setBusy(false); }
  };
  const updateSchedule = (day: string, change: Partial<Schedule>) => setSchedules(current => current.map(row => row.dia === day ? { ...row, ...change } : row));
  const saveSchedules = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!selected) return;
    setBusy(true); setError("");
    try { await api(`/admin/branches/${selected.id}/schedules`, { method: "PUT", body: JSON.stringify({ horarios: schedules.map(row => ({ dia: row.dia, apertura: row.apertura, cierre: row.cierre, activo: row.abierto })) }) }); setNotice("Horarios guardados."); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron guardar los horarios."); }
    finally { setBusy(false); }
  };
  const updateFee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("/admin/delivery/config", { method: "PUT", body: JSON.stringify({ tarifa: fee }) }); setNotice("Tarifa de domicilio actualizada."); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo actualizar la tarifa."); }
    finally { setBusy(false); }
  };
  const status = async (row: Branch) => {
    setBusy(true); setError("");
    try { await api(`/admin/branches/${row.id}/${row.activa ? "deactivate" : "activate"}`, { method: "PATCH" }); setNotice("Estado de la sucursal actualizado."); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo actualizar la sucursal."); }
    finally { setBusy(false); }
  };
  if (!allowed) return <p className="admin-message admin-message-error" role="alert">Tu rol no tiene acceso a la configuración de sucursales.</p>;
  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">SEDES Y PARÁMETROS</span><h1>Sucursales <em>conectadas.</em></h1><p>Administra los datos, horarios y la tarifa de domicilio de Amankay.</p></div>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    {loading && <p role="status">Cargando sucursales…</p>}
    <div className="admin-management-layout admin-branch-layout">
      <section className="admin-manual-order"><h2>{selected ? `Editar ${selected.nombre}` : "Nueva sucursal"}</h2><form className="admin-manual-form" onSubmit={save}><div className="admin-form-grid"><label>Nombre<input value={name} onChange={event => setName(event.target.value)} maxLength={100} required /></label><label>Tipo<select value={type} onChange={event => setType(event.target.value as typeof type)}><option value="SECUNDARIA">Secundaria</option><option value="PRINCIPAL">Principal</option></select></label><label>Dirección<input value={address} onChange={event => setAddress(event.target.value)} maxLength={240} required /></label><label>Teléfono<input value={phone} onChange={event => setPhone(event.target.value)} maxLength={30} /></label><label>Latitud (opcional)<input type="number" step="any" min={-90} max={90} value={lat} onChange={event => setLat(event.target.value)} /></label><label>Longitud (opcional)<input type="number" step="any" min={-180} max={180} value={lon} onChange={event => setLon(event.target.value)} /></label></div><div className="admin-table-actions"><button className="admin-fill" disabled={busy}>Guardar sucursal</button>{selected && <button type="button" onClick={clear}>Cancelar edición</button>}</div></form>{selected && <form className="admin-manual-form" onSubmit={saveSchedules}><h3>Horarios</h3><div className="admin-schedule-list">{schedules.map(row => <div className="admin-schedule-row" key={row.dia}><label><input type="checkbox" checked={row.abierto} onChange={event => updateSchedule(row.dia, { abierto: event.target.checked })} /> {row.dia}</label><label>Abre<input type="time" value={row.apertura} onChange={event => updateSchedule(row.dia, { apertura: event.target.value })} /></label><label>Cierra<input type="time" value={row.cierre} onChange={event => updateSchedule(row.dia, { cierre: event.target.value })} /></label></div>)}</div><button className="admin-primary-button" disabled={busy}>Guardar horarios</button></form>}</section>
      <section className="admin-dashboard-section"><h2>Sedes registradas</h2>{branches.length ? <div className="admin-order-list">{branches.map(row => <article key={row.id} className="admin-order-card"><div><span className="admin-eyebrow">{row.tipo} · {row.activa ? "ACTIVA" : "INACTIVA"}</span><h3>{row.nombre}</h3><p>{row.direccion} · {row.telefono}</p></div><div className="admin-order-end"><div className="admin-table-actions"><button type="button" onClick={() => edit(row)}>Editar y horarios</button><button type="button" disabled={busy} onClick={() => void status(row)}>{row.activa ? "Desactivar" : "Activar"}</button></div></div></article>)}</div> : !loading && <p className="admin-empty">No hay sucursales registradas.</p>}</section>
    </div>
    <section className="admin-manual-order"><h2>Domicilios en {delivery?.cobertura ?? "Neiva"}</h2><p>Tarifa actual: {delivery ? money(delivery.tarifa) : "sin configurar"}</p><form className="admin-manual-form" onSubmit={updateFee}><label>Tarifa adicional en COP<input type="number" min={0} step="0.01" value={fee} onChange={event => setFee(Number(event.target.value))} required /></label><button className="admin-primary-button" disabled={busy}>Guardar tarifa</button></form></section>
  </>;
}
