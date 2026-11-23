"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { api, type Branch } from "@/lib/api";

type User = { id: string; nombre: string; apellido: string; correo: string; telefono: string; activo: boolean; roles: string[]; sucursales: string[] };
type Role = { nombre: string; descripcion?: string };

export default function UsersPage() {
  const { staff } = useAdmin();
  const allowed = staff.roles.includes("ADMINISTRADOR");
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
  const [assignedBranches, setAssignedBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    try {
      const [people, roleRows, locationRows] = await Promise.all([
        api<User[]>("/admin/users"), api<Role[]>("/admin/users/roles"), api<Branch[]>("/admin/branches"),
      ]);
      setUsers(people); setRoles(roleRows); setBranches(locationRows); setError("");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudieron cargar los usuarios."); }
    finally { setLoading(false); }
  }, [allowed]);
  useEffect(() => { queueMicrotask(() => { void refresh(); }); }, [refresh]);

  const toggle = (value: string, current: string[], setter: (items: string[]) => void) => setter(current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  const clear = () => { setSelected(null); setFirst(""); setLast(""); setEmail(""); setPhone(""); setPassword(""); setAssignedRoles([]); setAssignedBranches([]); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!assignedRoles.length) { setError("Selecciona al menos un rol."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      if (selected) await api(`/admin/users/${selected.id}/assignments`, { method: "PUT", body: JSON.stringify({ roles: assignedRoles, sucursales: assignedBranches }) });
      else await api("/admin/users", { method: "POST", body: JSON.stringify({ nombre: first.trim(), apellido: last.trim(), correo: email.trim(), telefono: phone.trim(), contrasena: password, roles: assignedRoles, sucursales: assignedBranches }) });
      setNotice(selected ? "Roles y sucursales actualizados." : "Usuario creado."); clear(); await refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo guardar el usuario."); }
    finally { setBusy(false); }
  };
  const changeStatus = async (user: User) => {
    setBusy(true); setError("");
    try { await api(`/admin/users/${user.id}/${user.activo ? "deactivate" : "activate"}`, { method: "PATCH" }); setNotice("Estado del usuario actualizado."); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo cambiar el estado."); }
    finally { setBusy(false); }
  };
  if (!allowed) return <p className="admin-message admin-message-error" role="alert">Tu rol no tiene acceso a la gestión de usuarios.</p>;
  return <>
    <div className="admin-page-head"><span className="admin-eyebrow">PERSONAL Y ACCESO</span><h1>Usuarios <em>con alcance.</em></h1><p>Los roles definen las operaciones y las sucursales delimitan dónde se pueden realizar. Java valida ambos permisos.</p></div>
    <div className="admin-section-tools"><span>{users.filter(row => row.activo).length} usuarios activos</span><button type="button" onClick={() => void refresh()} disabled={loading}>Actualizar</button></div>
    {error && <p className="admin-message admin-message-error" role="alert">{error}</p>}
    {notice && <p className="admin-message" role="status">{notice}</p>}
    {loading && <p role="status">Cargando personal…</p>}
    <div className="admin-management-layout admin-user-layout">
      <section className="admin-manual-order"><h2>{selected ? `Asignaciones de ${selected.nombre}` : "Nuevo usuario"}</h2><form className="admin-manual-form" onSubmit={save}>{!selected && <div className="admin-form-grid"><label>Nombre<input value={first} onChange={event => setFirst(event.target.value)} required /></label><label>Apellido<input value={last} onChange={event => setLast(event.target.value)} required /></label><label>Correo<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label><label>Teléfono<input type="tel" value={phone} onChange={event => setPhone(event.target.value)} required /></label><label>Contraseña inicial<input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={12} autoComplete="new-password" required /></label></div>}
        <fieldset className="admin-choice-group"><legend>Roles</legend>{roles.map(role => <label key={role.nombre}><input type="checkbox" checked={assignedRoles.includes(role.nombre)} onChange={() => toggle(role.nombre, assignedRoles, setAssignedRoles)} /> <span><strong>{role.nombre}</strong><small>{role.descripcion}</small></span></label>)}</fieldset>
        <fieldset className="admin-choice-group"><legend>Sucursales</legend>{branches.map(branch => <label key={branch.id}><input type="checkbox" checked={assignedBranches.includes(branch.id)} onChange={() => toggle(branch.id, assignedBranches, setAssignedBranches)} /> <span className="admin-branch-choice"><strong>SEDE</strong><small>{branch.nombre.replace(/^sede\s+/i, "")}</small></span></label>)}</fieldset>
        <div className={selected ? "admin-table-actions admin-user-edit-actions" : "admin-table-actions"}><button className={selected ? "admin-fill" : "admin-fill admin-user-create-submit"} disabled={busy}>{selected ? "Guardar asignaciones" : "Crear usuario"}</button>{selected && <button type="button" onClick={clear}>Cancelar edición</button>}</div></form></section>
      <section className="admin-dashboard-section"><h2>Personal registrado</h2>{users.length ? <div className="admin-order-list">{users.map(user => <article className="admin-order-card" key={user.id}><div><span className="admin-eyebrow">{user.activo ? "ACTIVO" : "INACTIVO"}</span><h3>{user.nombre} {user.apellido}</h3><p>{user.correo} · {user.roles.join(", ")}</p><p>{user.sucursales.map(id => branches.find(branch => branch.id === id)?.nombre ?? "Sucursal").join(" · ")}</p></div><div className="admin-order-end"><div className="admin-table-actions"><button type="button" onClick={() => { setSelected(user); setAssignedRoles(user.roles); setAssignedBranches(user.sucursales); }}>Asignaciones</button><button type="button" disabled={busy || user.id === staff.id} onClick={() => void changeStatus(user)}>{user.activo ? "Desactivar" : "Activar"}</button></div></div></article>)}</div> : !loading && <p className="admin-empty">No hay usuarios registrados.</p>}</section>
    </div>
  </>;
}
