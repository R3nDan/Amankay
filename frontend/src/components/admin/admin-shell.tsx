"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ArrowRight, House, LogOut, PanelsTopLeft, RefreshCw, ClipboardList, Boxes, Truck, Wallet, ReceiptText, BookOpen, UsersRound, MapPin, ChartNoAxesCombined } from "lucide-react";
import { api, logout, type Branch, type Staff } from "@/lib/api";

type AdminState = { staff: Staff; branches: Branch[]; branchId: string; setBranchId: (id: string) => void };
const Context = createContext<AdminState | null>(null);
export function useAdmin() {
  const value = useContext(Context);
  if (!value) throw new Error("El panel requiere una sesión de personal.");
  return value;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    if (path === "/admin/login") return;
    let live = true;
    Promise.all([api<Staff>("/auth/me"), api<Branch[]>("/branches")])
      .then(([person, available]) => {
        if (!live) return;
        setStaff(person);
        const allowed = person.roles.includes("ADMINISTRADOR") ? available : available.filter(b => person.sucursales.includes(b.id));
        setBranches(allowed);
        setBranchId(current => allowed.some(b => b.id === current) ? current : allowed[0]?.id ?? "");
        setProblem("");
      })
      .catch(error => { if (live) {
        if (error.status === 401 || error.status === 403) router.replace("/admin/login");
        else setProblem(error.message);
      } })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [path, router]);

  if (path === "/admin/login") return <>{children}</>;
  if (loading) return <main className="admin-wait" aria-live="polite"><RefreshCw aria-hidden="true" /> Preparando tu espacio…</main>;
  if (problem) return <main className="admin-wait" role="alert"><p>{problem}</p><button className="action" onClick={() => location.reload()}>Reintentar</button></main>;
  if (!staff) return null;

  const links = [
    { href: "/admin", label: "Inicio", icon: House, roles: ["ADMINISTRADOR", "ATENCION", "INVENTARIO", "REPARTIDOR"] },
    { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList, roles: ["ATENCION"] },
    { href: "/admin/inventario", label: "Inventario", icon: Boxes, roles: ["INVENTARIO"] },
    { href: "/admin/reposiciones", label: "Reposiciones", icon: Truck, roles: ["INVENTARIO"] },
    { href: "/admin/entregas", label: "Entregas", icon: Truck, roles: ["ATENCION", "REPARTIDOR"] },
    { href: "/admin/pagos", label: "Pagos", icon: Wallet, roles: ["ATENCION"] },
    { href: "/admin/conciliaciones", label: "Conciliaciones", icon: ReceiptText, roles: ["ATENCION"] },
    { href: "/admin/catalogo", label: "Catálogo", icon: BookOpen, roles: ["ADMINISTRADOR"] },
    { href: "/admin/usuarios", label: "Usuarios", icon: UsersRound, roles: ["ADMINISTRADOR"] },
    { href: "/admin/sucursales", label: "Sucursales", icon: MapPin, roles: ["ADMINISTRADOR"] },
    { href: "/admin/reportes", label: "Reportes", icon: ChartNoAxesCombined, roles: ["ADMINISTRADOR", "ATENCION", "INVENTARIO"] },
    { href: "/admin/mesas", label: "Mesas y QR", icon: PanelsTopLeft, roles: ["ADMINISTRADOR", "ATENCION"] },
  ].filter(item => item.roles.some(role => staff.roles.includes(role)));

  const leave = async () => {
    try { await logout(); router.replace("/admin/login"); router.refresh(); }
    catch (error) { setProblem(error instanceof Error ? error.message : "No se pudo cerrar la sesión."); }
  };

  return <Context.Provider value={{ staff, branches, branchId, setBranchId }}>
    <div className="admin-frame">
      <aside className="admin-side">
        <Link className="admin-brand" href="/admin" aria-label="Amankay, inicio del panel"><Image src="/imagenes/marca/amankay.svg" alt="Amankay" width={68} height={70} /><span>Espacio de trabajo</span></Link>
        <nav aria-label="Panel administrativo">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined}><Icon size={19} aria-hidden="true" />{label}<ArrowRight size={15} className="admin-nav-arrow" aria-hidden="true" /></Link>)}</nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-identity"><strong>{staff.nombre} {staff.apellido}</strong><small>{staff.roles.join(" · ")}</small></div>
          <div className="admin-top-actions">
            {branches.length > 0 && <label>Sucursal <select className="admin-branch-select" value={branchId} onChange={event => setBranchId(event.target.value)}>{branches.map(branch => <option key={branch.id} value={branch.id}>{branch.nombre}</option>)}</select></label>}
            <button className="admin-logout-button" type="button" onClick={leave} aria-label="Cerrar sesión"><LogOut size={19} aria-hidden="true" /></button>
          </div>
        </header>
        <main id="contenido" className="admin-content" key={branchId}>{children}</main>
      </div>
    </div>
  </Context.Provider>;
}
