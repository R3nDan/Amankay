import { ProductGrid } from "@/components/product-grid";
import { ActionLink } from "@/components/ui/action-link";
import { categories, products } from "@/data/bakery";
import { BebidasSymbolPattern, FritosSymbolPattern, PanaderiaSymbolPattern } from "@/components/ui/bakery-symbol-pattern";

const categoryPatterns = {
  panaderia: PanaderiaSymbolPattern,
  fritos: FritosSymbolPattern,
  bebidas: BebidasSymbolPattern,
};

export default function Menu() {
  return <main id="contenido" className="inner-page catalog-page catalog-overview">
    <header className="catalog-intro">
      <div className="wrap catalog-intro-content">
        <h1>Nuestro <em>catálogo.</em></h1>
        <p>Panadería, fritos y bebidas para elegir lo que más se te antoje.</p>
      </div>
    </header>
    {categories.map(category => {
      const Pattern = categoryPatterns[category.slug];
      return <section className="catalog-section" key={category.slug} aria-labelledby={`catalog-${category.slug}`}>
        <div className="catalog-section-heading category-heading-band">
          <Pattern />
          <div className="wrap section-head">
            <h2 id={`catalog-${category.slug}`}>{category.name}</h2>
            <ActionLink subtle href={`/menu/${category.slug}`}>Ver {category.name.toLowerCase()}</ActionLink>
          </div>
        </div>
        <div className="catalog-section-products category-products-band"><div className="wrap">
          <ProductGrid items={products.filter(product => product.category === category.slug)} />
        </div></div>
      </section>;
    })}
  </main>;
}
