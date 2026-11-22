import Image from "next/image";
import { CupSoda, Utensils } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { type Product } from "@/data/bakery";
import { TiltCard } from "@/components/ui/tilt-card";

export function ProductGrid({ items }: { items: readonly Product[] }) {
  return <ul className="product-grid">{items.map(product =>
    <li key={product.id}><TiltCard><article>
      {product.photo ? <div className="product-photo"><Image src={product.photo} alt={product.name} fill sizes="(max-width: 600px) 90vw, (max-width: 900px) 43vw, (max-width: 1100px) 29vw, 24vw" /></div>
        : <div className="product-photo product-pending" aria-label="Fotografía pendiente">
          {product.category === "bebidas" ? <CupSoda size={48} strokeWidth={1} aria-hidden /> : <Utensils size={48} strokeWidth={1} aria-hidden />}
          <span>Pronto, en imágenes.</span>
        </div>}
      <h3>{product.name}</h3>{product.description && <p>{product.description}</p>}
      {product.price !== undefined && <div className="product-meta"><span>{formatPrice(product.price)}</span></div>}
    </article></TiltCard></li>
  )}</ul>;
}
