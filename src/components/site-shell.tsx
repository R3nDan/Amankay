import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";

export function Header() {
  return <header className="masthead"><div className="wrap nav-row">
    <Link className="signature" href="/" aria-label="Amankay, inicio">
      <Image src="/imagenes/amankay.svg" alt="" width={50} height={52} priority />
      <span>Amankay</span>
    </Link>
    <nav aria-label="Navegación principal">
      <Link href="/">Inicio</Link><Link href="/menu">Catálogo</Link><Link href="/#proceso">El proceso</Link>
    </nav>
    <Link className="branch-nav" href="/sucursales"><MapPin size={16} /> Sucursales <ArrowUpRight size={15} /></Link>
  </div></header>;
}

export function Footer() {
  return <footer><div className="wrap foot-row">
    <span className="footer-name">Amankay <small>· Plataforma de pedidos</small></span>
    <nav aria-label="Pie de página"><Link href="/menu">Catálogo</Link><Link href="/sucursales">Sucursales</Link></nav>
  </div></footer>;
}
