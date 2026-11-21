import Image from "next/image";
import { CupSoda, Utensils } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { categories, type Product } from "@/data/bakery";

export function ProductGrid({ items }: { items: readonly Product[] }) {
  return <ul className="product-grid">{items.map(product =>
    <li key={product.id}><article>
      {product.photo ? <div className="product-photo"><Image src={product.photo} alt={product.name} fill sizes="(max-width: 600px) 90vw, (max-width: 900px) 43vw, 30vw" /></div>
        : <div className="product-photo product-pending" aria-label="Fotografía pendiente">
          {product.category === "bebidas" ? <CupSoda size={48} strokeWidth={1} aria-hidden /> : <Utensils size={48} strokeWidth={1} aria-hidden />}
          <span>Pronto, en imágenes.</span>
        </div>}
      <div className="product-meta"><span>{categories.find(category => category.slug === product.category)?.name}</span>
        {product.price !== undefined && <span>{formatPrice(product.price)}</span>}
      </div>
      <h3>{product.name}</h3>{product.description && <p>{product.description}</p>}
    </article></li>
  )}</ul>;
}
