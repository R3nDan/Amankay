import { ProductGrid } from "@/components/product-grid";
import { ActionLink } from "@/components/ui/action-link";
import { categories, products, type CategorySlug } from "@/data/bakery";
import { BebidasSymbolPattern, FritosSymbolPattern, PanaderiaSymbolPattern } from "@/components/ui/bakery-symbol-pattern";

export function CategoryContent({ slug }: { slug: CategorySlug }) {
  const category = categories.find(item => item.slug === slug)!;
  return <main id="contenido" className="inner-page catalog-page category-page">
    <section className={`category-heading-band${slug === "panaderia" ? " bakery-heading-band" : ""}`}>
      {slug === "panaderia" ? <PanaderiaSymbolPattern /> : slug === "fritos" ? <FritosSymbolPattern /> : <BebidasSymbolPattern />}
      <div className="wrap category-page-content">
        <div className="catalog-heading category-page-heading">
          <h1>{category.name}</h1>
        </div>
      </div>
    </section>
    <section className="category-products-band">
      <div className="wrap category-page-content">
        <ProductGrid items={products.filter(product => product.category === slug)} />
        <ActionLink subtle href="/menu">Explorar todo el catálogo</ActionLink>
      </div>
    </section>
  </main>;
}
