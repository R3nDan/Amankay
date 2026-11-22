import { ProductGrid } from "@/components/product-grid";
import { ActionLink } from "@/components/ui/action-link";
import { categories, products } from "@/data/bakery";

export default function Menu() {
  return <main id="contenido" className="wrap inner-page catalog-page">
    <div className="catalog-heading"><p className="kicker">Elige tu próximo antojo</p><h1>Nuestro <em>catálogo.</em></h1><p className="lead">Panadería, fritos y bebidas para compartir un buen momento.</p></div>
    {categories.map(category => <section className="catalog-section" key={category.slug} aria-labelledby={category.slug}>
      <div className="section-head"><h2 id={category.slug}>{category.name}</h2><ActionLink subtle href={`/menu/${category.slug}`}>Ver {category.name.toLowerCase()}</ActionLink></div>
      <ProductGrid items={products.filter(product => product.category === category.slug)} />
    </section>)}
  </main>;
}
