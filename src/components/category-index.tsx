import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/bakery";
import { TiltCard } from "@/components/ui/tilt-card";
import { ActionLink } from "@/components/ui/action-link";
import { BakerySymbolSet } from "@/components/ui/bakery-symbol-pattern";

const categoryVisuals = [
  { image: "/imagenes/productos/panaderia/pan-queso.webp", alt: "Pan de queso recién horneado" },
  { image: "/imagenes/productos/fritos/empanada.webp", alt: "Empanada dorada" },
  { image: "/imagenes/productos/Bebidas/Avena.jpeg", alt: "Avena servida en vaso" },
];

export function CategoryIndex() {
  return <section className="category-showcase wrap" aria-labelledby="category-title">
    <div className="category-showcase-head">
      <div className="category-frame-corners" aria-hidden="true"><span /><span /></div>
      <div className="category-heading-art" aria-hidden><BakerySymbolSet /></div>
      <h2 id="category-title">¿Qué se te <em>antoja hoy?</em></h2></div>
    <nav className="category-index" aria-label="Explorar categorías">
      {categories.map((category, index) => {
        const visual = categoryVisuals[index];
        return <Link key={category.slug} href={`/menu/${category.slug}`}>
          <TiltCard>
          <div className={`category-image category-image-${category.slug}`}>
            <Image src={visual.image} alt={visual.alt} fill sizes="(max-width: 600px) 90vw, 31vw" />
          </div>
          <div className="category-card-copy"><h3>{category.name}</h3><p>{category.detail}</p></div>
          </TiltCard>
        </Link>;
      })}
    </nav>
    <div className="category-showcase-cta">
      <div className="category-frame-cta-corners" aria-hidden="true"><span /><span /></div>
      <span className="category-cta-rule" aria-hidden="true" />
      <ActionLink subtle arrow={false} href="/menu">Ver catálogo completo</ActionLink>
      <span className="category-cta-rule" aria-hidden="true" />
    </div>
  </section>;
}
