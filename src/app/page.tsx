import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { RevealSections } from "@/components/reveal-sections";
import { ActionLink } from "@/components/ui/action-link";
import { ProductGrid } from "@/components/product-grid";
import { BreadProcess } from "@/components/bread-process";
import { CategoryIndex } from "@/components/category-index";
import { HomeIntro } from "@/components/home-intro";
import { products } from "@/data/bakery";

export default function Home() {
  return <main id="contenido">
    <RevealSections />
    <section className="hero" aria-labelledby="portada">
      <Image className="hero-photo" src="/imagenes/portada/hornada.webp" alt="Panecillos dorados y una pieza abierta sobre una bandeja de horno" fill preload sizes="100vw" />
      <div className="hero-shade" />
      <div className="hero-copy">
        <p className="hero-kicker"><span /> Un antojo puede cambiar el día</p>
        <h1 id="portada">Algo rico.<br /><em>Algo para recordar.</em></h1>
        <p className="hero-intro">Pan recién horneado, algo crujiente,<br className="desktop-break" /> una bebida para acompañar.</p>
        <div className="hero-actions"><ActionLink href="/menu">Explorar el menú</ActionLink>
          <Link className="process-link" href="#category-title">Encuentra tu antojo <ArrowDown size={17} aria-hidden /></Link>
        </div>
      </div>
      <div className="hero-bottom"><span>Panadería · Fritos · Bebidas</span><span>Del horno, con cariño.</span></div>
      <span className="hero-index" aria-hidden>01 / 03</span>
    </section>
    <CategoryIndex />
    <section className="wrap selection" aria-labelledby="seleccion">
      <div className="section-head"><div><p className="kicker"><span /> Recién salido del horno</p>
        <h2 id="seleccion">Pequeños favoritos,<br /><em>grandes antojos.</em></h2></div>
        <div className="section-aside"><p>Un primer vistazo<br />a nuestra panadería.</p><ActionLink subtle href="/menu/panaderia">Ver toda la panadería</ActionLink></div></div>
      <ProductGrid items={products.filter(product => product.category === "panaderia").slice(0, 3)} />
      <p className="catalogue-note">Precios y disponibilidad por confirmar.</p>
    </section>
    <BreadProcess />
    <HomeIntro />
    <section className="branch-section" id="despues-del-proceso" aria-labelledby="branches-title">
      <div className="wrap branch-call"><div><p className="kicker"><MapPin size={16} aria-hidden /> Cerca de ti</p>
        <h2 id="branches-title">¿Pasas por aquí?</h2>
        <p className="branch-intro">Consulta las sucursales y encuentra dónde disfrutar tu próximo antojo.</p></div>
        <Link href="/sucursales" className="branch-circle"><span>Conoce nuestras<br />sucursales</span><ArrowUpRight size={30} strokeWidth={1.3} aria-hidden /></Link></div>
    </section>
  </main>;
}
