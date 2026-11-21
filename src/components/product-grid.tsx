import Image from "next/image";
import { formatPrice } from "@/lib/currency";
import { products } from "@/data/bakery";

export function ProductGrid() {
  return <ul className="product-grid">{products.map(product =>
    <li key={product.photo}><article>
      <div className="product-photo"><Image src={`/imagenes/${product.photo}.webp`} alt={product.name} fill sizes="(max-width: 600px) 94vw, 32vw" /></div>
      <div className="product-meta"><span>{product.category}</span><span>{formatPrice(product.price)}</span></div>
      <h3>{product.name}</h3><p>{product.description}</p>
    </article></li>
  )}</ul>;
}
