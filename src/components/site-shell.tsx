import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { CategoryNav } from "@/components/category-nav";
import { RoyalWheatOrnament, WheatScrollConnector } from "@/components/ui/royal-wheat-ornament";

export function Header() {
  return <header className="masthead">
    <div className="wrap masthead-top">
      <RoyalWheatOrnament side="left" />
      <Link className="signature" href="/" aria-label="Amankay, inicio">
        <Image src="/imagenes/marca/amankay.svg" alt="" width={84} height={88} preload />
      </Link>
      <RoyalWheatOrnament side="right" />
      <div className="masthead-ornament-extensions" aria-hidden="true">
        <WheatScrollConnector side="left" />
        <WheatScrollConnector side="right" />
      </div>
    </div>
    <CategoryNav />
  </header>;
}

export function Footer() {
  return <footer className="site-footer"><div className="wrap footer-main">
    <Link className="footer-signature" href="/" aria-label="Amankay, inicio">
      <Image src="/imagenes/marca/amankay.svg" alt="" width={58} height={62} />
      <span className="footer-signature-copy"><span className="footer-wordmark">Amankay</span><span className="footer-tagline">Los buenos momentos<br /><em>se comparten.</em></span></span>
    </Link>
    <nav className="footer-navigation" aria-label="Enlaces del pie de página">
      <Link href="/menu"><span className="footer-link-index">01</span><span>Catálogo</span><ArrowUpRight size={15} aria-hidden /></Link>
      <Link href="/sucursales"><span className="footer-link-index">02</span><span>Sucursales</span><ArrowUpRight size={15} aria-hidden /></Link>
      <Link href="/#proceso"><span className="footer-link-index">03</span><span>El oficio del pan</span><ArrowUpRight size={15} aria-hidden /></Link>
    </nav>
  </div><div className="wrap footer-bottom"><span>Amankay</span><span className="footer-bottom-rule" aria-hidden="true" /><span>Panadería · Fritos · Bebidas</span></div></footer>;
}
