import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CupSoda } from "lucide-react";
import { categories } from "@/data/bakery";

const categoryVisuals = [
  { image: "/imagenes/productos/panaderia/pan-queso.webp", alt: "Pan de queso recién horneado", symbol: null },
  { image: "/imagenes/productos/fritos/empanada.webp", alt: "Empanada dorada", symbol: null },
  { image: null, alt: "", symbol: CupSoda },
];

export function CategoryIndex() {
  return <section className="category-showcase wrap" aria-labelledby="category-title">
    <div className="category-showcase-head"><p className="kicker"><span /> Encuentra tu antojo</p>
      <h2 id="category-title">¿Qué se te <em>antoja hoy?</em></h2></div>
    <nav className="category-index" aria-label="Explorar categorías">
      {categories.map((category, index) => {
        const visual = categoryVisuals[index];
        const Symbol = visual.symbol;
        return <Link key={category.slug} href={`/menu/${category.slug}`}>
          <div className={`category-image category-image-${category.slug}`}>
            {visual.image ? <Image src={visual.image} alt={visual.alt} fill sizes="(max-width: 600px) 90vw, 31vw" /> :
              <><span className="category-monogram">b</span>{Symbol && <Symbol size={66} strokeWidth={1} aria-hidden />}</>}
            <span className="category-index-label">{category.number} / Colección</span>
            <span className="category-arrow"><ArrowUpRight size={22} strokeWidth={1.5} aria-hidden /></span>
          </div>
          <div className="category-card-copy"><h3>{category.name}</h3><p>{category.detail}</p></div>
        </Link>;
      })}
    </nav>
  </section>;
}
