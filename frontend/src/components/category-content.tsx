"use client";

import { ProductGrid } from "@/components/product-grid";
import { ActionLink } from "@/components/ui/action-link";
import { categories, products, type CategorySlug } from "@/data/bakery";
import { BebidasSymbolPattern, FritosSymbolPattern, PanaderiaSymbolPattern } from "@/components/ui/bakery-symbol-pattern";
import { useI18n } from "@/lib/i18n";

export function CategoryContent({ slug }: { slug: CategorySlug }) {
  const { t } = useI18n();
  const category = categories.find(item => item.slug === slug)!;
  return <main id="contenido" className="inner-page catalog-page category-page">
    <section className={`category-heading-band category-page-texture${slug === "panaderia" ? " bakery-heading-band" : ""}`} aria-label={`${t("Textura de ")} ${t(category.name)}`}>
      {slug === "panaderia" ? <PanaderiaSymbolPattern /> : slug === "fritos" ? <FritosSymbolPattern /> : <BebidasSymbolPattern />}
    </section>
    <section className="category-products-band">
      <div className="wrap category-page-content">
        <h1 className="visually-hidden">{t(category.name)}</h1>
        <ProductGrid items={products.filter(product => product.category === slug)} />
        <div className="category-products-cta">
          <ActionLink href="/menu">{t("Ver el catálogo")}</ActionLink>
        </div>
      </div>
    </section>
    <div className={`category-heading-band category-page-texture${slug === "panaderia" ? " bakery-heading-band" : ""}`} aria-hidden="true">
      {slug === "panaderia" ? <PanaderiaSymbolPattern /> : slug === "fritos" ? <FritosSymbolPattern /> : <BebidasSymbolPattern />}
    </div>
  </main>;
}
