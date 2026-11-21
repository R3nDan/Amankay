import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { ActionLink } from "@/components/ui/action-link";
import { categories, products } from "@/data/bakery";

export const dynamicParams = false;
export function generateStaticParams() {
  return categories.map(category => ({ categoria: category.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const category = categories.find(item => item.slug === categoria);
  if (!category) notFound();
  return <main id="contenido" className="wrap inner-page catalog-page">
    <div className="catalog-heading">
      <p className="kicker">{category.number} / Nuestro catálogo</p>
      <h1>{category.name}</h1><p className="lead">{category.intro}</p>
      <p className="catalogue-note">Precios y disponibilidad por confirmar.</p>
    </div>
    <ProductGrid items={products.filter(product => product.category === category.slug)} />
    <ActionLink subtle href="/menu">Explorar todo el catálogo</ActionLink>
  </main>;
}
