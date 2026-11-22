export const categories = [
  { slug: "panaderia", name: "Panadería", number: "01", detail: "Panes, croissants y mojicones.", intro: "Cortezas doradas, miga suave y algo rico para compartir." },
  { slug: "fritos", name: "Fritos", number: "02", detail: "Empanadas y pasteles.", intro: "Empanadas y pasteles: descubre esta parte de nuestra selección." },
  { slug: "bebidas", name: "Bebidas", number: "03", detail: "Avena, sevillana y guarapo.", intro: "Avena, sevillana y guarapo para acompañar tu elección." },
] as const;

export type CategorySlug = typeof categories[number]["slug"];
export type Product = { id: string; name: string; category: CategorySlug; photo?: string; description?: string; price?: number };

// Catálogo visual. Precios, recetas y disponibilidad comercial por confirmar.
export const products: readonly Product[] = [
  { id: "pan-queso", name: "Pan de queso", category: "panaderia", photo: "/imagenes/productos/panaderia/pan-queso.webp" },
  { id: "croissant", name: "Croissant", category: "panaderia", photo: "/imagenes/productos/panaderia/Croissant.jpeg" },
  { id: "mojicon-bocadillo", name: "Mojicón de bocadillo", category: "panaderia", photo: "/imagenes/productos/panaderia/mojicon-bocadillo.webp" },
  { id: "pan-hawaiano", name: "Pan hawaiano", category: "panaderia", photo: "/imagenes/productos/panaderia/pan-hawaiano.webp" },
  { id: "pan-salchicha", name: "Pan de salchicha", category: "panaderia", photo: "/imagenes/productos/panaderia/pan-salchicha.webp" },
  { id: "pan-agridulce", name: "Pan agridulce", category: "panaderia", photo: "/imagenes/productos/panaderia/pan-agridulce.webp" },
  { id: "mojicon-queso", name: "Mojicón de queso", category: "panaderia", photo: "/imagenes/productos/panaderia/mojicon-queso.webp" },
  { id: "mojicon-arequipe-queso", name: "Mojicón de arequipe y queso", category: "panaderia", photo: "/imagenes/productos/panaderia/mojicon-arequipe-queso.webp" },
  { id: "empanada", name: "Empanada", category: "fritos", photo: "/imagenes/productos/fritos/empanada.webp" },
  { id: "arepa-huevo", name: "Arepa de huevo", category: "fritos", photo: "/imagenes/productos/fritos/arepa-huevo.webp" },
  { id: "pastel-carne", name: "Pastel de carne", category: "fritos", photo: "/imagenes/productos/fritos/pastel-carne.webp" },
  { id: "pastel-chorizo", name: "Pastel de chorizo", category: "fritos", photo: "/imagenes/productos/fritos/pastel-chorizo.webp" },
  { id: "pastel-huevo", name: "Pastel de huevo", category: "fritos", photo: "/imagenes/productos/fritos/pastel-huevo.webp" },
  { id: "pastel-mixto", name: "Pastel mixto", category: "fritos", photo: "/imagenes/productos/fritos/pastel-mixto.webp" },
  { id: "pastel-pollo", name: "Pastel de pollo", category: "fritos", photo: "/imagenes/productos/fritos/pastel-pollo.webp" },
  { id: "avena", name: "Avena", category: "bebidas", photo: "/imagenes/productos/Bebidas/Avena.jpeg" },
  { id: "sevillana", name: "Sevillana", category: "bebidas", photo: "/imagenes/productos/Bebidas/Sevillana.jpeg" },
  { id: "guarapo", name: "Guarapo", category: "bebidas", photo: "/imagenes/productos/Bebidas/Gurapo.jpeg" },
];
