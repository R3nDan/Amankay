import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { RevealSections } from "@/components/reveal-sections";
import { ActionLink } from "@/components/ui/action-link";
import { ProductGrid } from "@/components/product-grid";
import { BreadProcess } from "@/components/bread-process";
import { CategoryIndex } from "@/components/category-index";
import { HomeIntro } from "@/components/home-intro";
import { HomeHero } from "@/components/home-hero";
import { products } from "@/data/bakery";

export function HomeContent({ preview = false }: { preview?: boolean }) {
  return <main id="contenido" className="home-page">
    {!preview && <RevealSections />}
    <HomeHero />
    <CategoryIndex />
    <section className="wrap selection" aria-labelledby="seleccion">
      <div className="section-head"><div><p className="kicker"><span /> Panadería</p>
        <h2 id="seleccion">Del <em>horno.</em></h2></div>
        <div className="section-aside"><ActionLink subtle href="/menu/panaderia">Ver toda</ActionLink></div></div>
      <ProductGrid items={products.filter(product => product.category === "panaderia").slice(0, 3)} />
    </section>
    <BreadProcess preview={preview} />
    <HomeIntro />
    <section className="branch-section" id="despues-del-proceso" aria-labelledby="branches-title">
      <div className="wrap branch-call"><div><p className="kicker"><MapPin size={16} aria-hidden /> Nos vemos por aquí</p>
        <h2 id="branches-title">Sucursales</h2></div>
        <Link href="/sucursales" className="branch-circle"><span>Consultar</span><ArrowUpRight size={30} strokeWidth={1.3} aria-hidden /></Link></div>
    </section>
  </main>;
}
