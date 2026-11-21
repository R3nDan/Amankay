import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Wheat, MapPin } from "lucide-react";
import { RevealSections } from "@/components/reveal-sections";
import { ActionLink } from "@/components/ui/action-link";
import { ProductGrid } from "@/components/product-grid";
import { BreadProcess } from "@/components/bread-process";

export default function Home() {
  return <main id="contenido">
    <RevealSections />
    <section className="hero" aria-labelledby="portada">
      <Image className="hero-photo" src="/imagenes/hornada.webp" alt="Panecillos dorados y una pieza abierta sobre una bandeja de horno" fill preload sizes="100vw" />
      <div className="hero-shade" />
      <div className="hero-copy">
        <p className="hero-kicker"><Wheat size={20} strokeWidth={1.5} /> Panadería artesanal</p>
        <h1 id="portada">De la masa<br /><em>a tu mesa.</em></h1>
        <p className="hero-intro">Miga suave, corteza dorada y el aroma de una buena hornada.</p>
        <div className="hero-actions"><ActionLink href="/menu">Explorar catálogo</ActionLink>
          <Link className="process-link" href="/sucursales"><MapPin size={19} strokeWidth={1.5} /> Ver sucursales</Link>
        </div>
      </div>
      <Link href="#proceso" className="contact-print">
        <Image src="/imagenes/forma.webp" width={72} height={60} alt="" />
        <span><small>El proceso</small>Del amasado al horno</span><ArrowUpRight size={20} />
      </Link>
    </section>
    <section className="wrap selection" aria-labelledby="seleccion">
      <div className="section-head"><div><p className="kicker"><span /> Productos destacados</p>
        <h2 id="seleccion">La selección <em>del horno.</em></h2></div>
        <ActionLink subtle href="/menu">Ver catálogo completo</ActionLink></div>
      <ProductGrid />
    </section>
    <BreadProcess />
    <section className="wrap branch-call"><div><MapPin size={22} aria-hidden /><h2>Encuentra tu sucursal.</h2></div><ActionLink subtle href="/sucursales">Consultar sucursales</ActionLink></section>
  </main>;
}
