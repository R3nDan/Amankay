import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin, BookOpen } from "lucide-react";
import { CategoryNav } from "@/components/category-nav";

export function Header() {
  return <header className="masthead">
    <div className="wrap masthead-top">
      <Link className="header-utility" href="/sucursales"><MapPin size={18} aria-hidden /><span>Sucursales</span></Link>
      <Link className="signature" href="/" aria-label="Amankay, inicio">
        <Image src="/imagenes/marca/amankay.svg" alt="" width={84} height={88} preload />
      </Link>
      <Link className="header-utility catalogue-link" href="/menu"><span>Ver catálogo</span><BookOpen size={19} aria-hidden /></Link>
    </div>
    <CategoryNav />
  </header>;
}

export function Footer() {
  return <footer><div className="wrap footer-main">
    <div className="footer-signature"><Image src="/imagenes/marca/amankay.svg" alt="" width={52} height={56} /><p>Los buenos momentos<br /><em>se comparten.</em></p></div>
    <nav aria-label="Pie de página"><Link href="/menu">Catálogo <ArrowUpRight size={15} aria-hidden /></Link><Link href="/sucursales">Sucursales <ArrowUpRight size={15} aria-hidden /></Link><Link href="/#proceso">El oficio del pan <ArrowUpRight size={15} aria-hidden /></Link></nav>
  </div><div className="wrap footer-bottom"><span>Amankay</span><span>Panadería · Fritos · Bebidas</span></div></footer>;
}
