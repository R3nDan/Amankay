import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { CategoryNav } from "@/components/category-nav";
import { HeaderCornerFrame } from "@/components/ui/header-corner-frame";
import { HomeLogoLink } from "@/components/home-logo-link";
import { branches } from "@/data/branches";
import { LanguageSwitch, useI18n } from "@/lib/i18n";

export function Header() {
  return <header className="masthead">
    <div className="wrap masthead-top">
      <div className="masthead-corners" aria-hidden="true">
        <HeaderCornerFrame side="left" />
        <HeaderCornerFrame side="right" />
      </div>
      <HomeLogoLink />
      <LanguageSwitch className="masthead-language" />
    </div>
    <CategoryNav />
  </header>;
}

export function Footer() {
  const principal = branches[0];
  const { t } = useI18n();
  return <footer className="site-footer" id="pie">
    <div className="wrap footer-main">
      <div className="footer-brand">
        <Link className="footer-signature" href="/#inicio" aria-label={t("Amankay, volver al inicio")}>
          <Image src="/imagenes/marca/amankay.svg" alt="" width={66} height={72} />
          <span className="footer-signature-copy"><span className="footer-wordmark">Amankay</span><span className="footer-tagline">{t("Los buenos momentos")}<br /><em>{t("se comparten.")}</em></span></span>
        </Link>
        <p>{t("Panadería, fritos y bebidas en Neiva.")}</p>
      </div>
      <nav className="footer-navigation" aria-label={t("Explora Amankay")}>
        <h2>{t("Explora")}</h2>
        <Link href="/menu">{t("Catálogo")} <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <Link href="/#acerca">{t("Acerca de nosotros")} <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <Link href="/#proceso">{t("El oficio del pan")} <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </nav>
      <div className="footer-visit">
        <h2>{t("Visítanos")}</h2>
        <Link href="/#contacto"><MapPin size={17} aria-hidden="true" /><span>{principal?.address}</span></Link>
        <a href={`tel:${principal?.phone.replace(/[^+\d]/g, "")}`}><Phone size={17} aria-hidden="true" /><span>{principal?.phone}</span></a>
        <p>{t("Lun–vie")} {principal?.weekdays}<br />{t("Sáb")} {principal?.saturday}<br />{t("Domingos y festivos · Cerrado")}</p>
      </div>
    </div>
    <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Amankay</span><span>Neiva, Huila</span><Link href="/#inicio">{t("Volver arriba ↑")}</Link></div>
  </footer>;
}
