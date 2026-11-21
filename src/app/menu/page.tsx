import { ProductGrid } from "@/components/product-grid";
import { ActionLink } from "@/components/ui/action-link";
export const metadata = { title: "Catálogo" };
export default function Menu() {
  return <main id="contenido" className="wrap inner-page"><h1>Catálogo <em>de panes.</em></h1>
    <p className="lead">Selección de muestra · Precios en pesos colombianos.</p>
    <ProductGrid /><ActionLink subtle href="/">Volver al inicio</ActionLink>
  </main>;
}
