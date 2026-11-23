"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { api, login, type Staff } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { api<Staff>("/auth/me").then(() => router.replace("/admin")).catch(() => {}); }, [router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await login(email, password); router.replace("/admin"); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo iniciar sesión."); }
    finally { setBusy(false); }
  };

  return <main id="contenido" className="admin-login">
    <div className="admin-login-card">
      <Link href="/" className="admin-login-logo" aria-label="Ir al inicio de Amankay"><Image src="/imagenes/marca/amankay.svg" alt="" width={82} height={88} /></Link>
      <div className="admin-login-rule"><span /><LockKeyhole size={18} aria-hidden="true" /><span /></div>
      <p className="admin-eyebrow">ESPACIO DEL EQUIPO</p>
      <h1>Bienvenido <em>de nuevo.</em></h1>
      <p className="admin-login-intro">Ingresa con tu cuenta de personal para continuar la jornada.</p>
      <form onSubmit={submit}>
        <label htmlFor="admin-email">Correo electrónico</label>
        <input id="admin-email" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required />
        <label htmlFor="admin-password">Contraseña</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
        {error && <p role="alert" className="admin-error">{error}</p>}
        <button className="action" disabled={busy} type="submit">{busy ? "Entrando…" : "Entrar al panel"}<ArrowRight size={18} aria-hidden="true" /></button>
      </form>
      <Link className="admin-back" href="/">Volver al sitio público</Link>
    </div>
  </main>;
}
