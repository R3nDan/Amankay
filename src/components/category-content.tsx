import { ProductGrid } from "@/components/product-grid";
import { ActionLink } from "@/components/ui/action-link";
import { categories, products, type CategorySlug } from "@/data/bakery";

export function CategoryContent({ slug }: { slug: CategorySlug }) {
  const category = categories.find(item => item.slug === slug)!;
  return <main id="contenido" className="wrap inner-page catalog-page">
    <div className="catalog-heading">
      <h1>{category.name}</h1><p className="lead">{category.intro}</p>
    </div>
    <ProductGrid items={products.filter(product => product.category === slug)} />
    <ActionLink subtle href="/menu">Explorar todo el catálogo</ActionLink>
  </main>;
}
