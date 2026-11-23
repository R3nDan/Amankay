"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { api, login, type Staff } from "@/lib/api";
import { LanguageSwitch, useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const { t } = useI18n();
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
    <a className="skip" href="#admin-email">{t("Saltar al contenido")}</a>
    <div className="admin-login-card">
      <LanguageSwitch className="admin-login-language" />
      <Link href="/" className="admin-login-logo" aria-label="Ir al inicio de Amankay"><Image src="/imagenes/marca/amankay.svg" alt="" width={82} height={88} /></Link>
      <div className="admin-login-rule"><span /><LockKeyhole size={18} aria-hidden="true" /><span /></div>
      <p className="admin-eyebrow">{t("ESPACIO DEL EQUIPO")}</p>
      <h1>{t("Bienvenido")} <em>{t("de nuevo.")}</em></h1>
      <p className="admin-login-intro" id="login-help">{t("Ingresa con tu cuenta de personal para continuar la jornada.")}</p>
      <form onSubmit={submit}>
        <label htmlFor="admin-email">{t("Correo electrónico")}</label>
        <input id="admin-email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} value={email} onChange={event => setEmail(event.target.value)} required aria-describedby="login-help" />
        <label htmlFor="admin-password">{t("Contraseña")}</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
        {error && <p role="alert" className="admin-error">{t(error)}</p>}
        <button className="action" disabled={busy} type="submit">{busy ? t("Entrando…") : t("Entrar al panel")}<ArrowRight size={18} aria-hidden="true" /></button>
      </form>
      <Link className="admin-back" href="/">{t("Volver al sitio público")}</Link>
    </div>
  </main>;
}
