export const categories = [
  { slug: "panaderia", name: "Panadería", number: "01", detail: "Panes, croissants y mojicones.", intro: "Cortezas doradas, miga suave y algo rico para compartir." },
  { slug: "fritos", name: "Fritos", number: "02", detail: "Empanadas y pasteles.", intro: "Empanadas y pasteles: descubre esta parte de nuestra selección." },
  { slug: "bebidas", name: "Bebidas", number: "03", detail: "Avena, sevillana y guarapo.", intro: "Avena, sevillana y guarapo para acompañar tu elección." },
] as const;

export type CategorySlug = typeof categories[number]["slug"];
export type Product = { id: string; name: string; category: CategorySlug; photo?: string; description?: string; price?: number };

// Precios indicados por el usuario; recetas y existencias comerciales siguen pendientes.
const catalogProducts: readonly Product[] = [
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

const shortDescriptions: Record<string, string> = {
  "pan-queso": "Miga tierna y dorado apetitoso: un clásico para disfrutar sin afán.",
  croissant: "Capas delicadas, exterior dorado y forma de media luna irresistible.",
  "mojicon-bocadillo": "Suave por dentro, doradito por fuera y con el dulce sabor del bocadillo.",
  "pan-hawaiano": "Un pan suave y dorado, perfecto para darle un toque especial a la pausa.",
  "pan-salchicha": "Pan suave con salchicha: práctico, sabroso y listo para disfrutar.",
  "pan-agridulce": "Un bocado de contraste entre notas dulces y saladas, con miga suave.",
  "mojicon-queso": "Mojicón dorado con queso: pequeño, suave y lleno de sabor.",
  "mojicon-arequipe-queso": "El encuentro del arequipe y el queso en un mojicón tierno y doradito.",
  empanada: "Masa crujiente, forma clásica y un relleno que invita a otro mordisco.",
  "arepa-huevo": "Arepa dorada y crujiente, con huevo en el corazón de cada bocado.",
  "pastel-carne": "Masa doradita y relleno de carne: un frito contundente para cualquier pausa.",
  "pastel-chorizo": "Crujiente por fuera y con el sabor intenso del chorizo en su interior.",
  "pastel-huevo": "Una cubierta dorada guarda un relleno sencillo y sabroso de huevo.",
  "pastel-mixto": "Una mezcla de sabores envuelta en masa crujiente, ideal para abrir el apetito.",
  "pastel-pollo": "Pollo envuelto en una masa dorada y crujiente, perfecto para cualquier pausa.",
  avena: "Suave y refrescante, acompaña muy bien una pausa con pan o algo frito.",
  sevillana: "Una bebida tradicional, fresca y lista para acompañar tus antojos.",
  guarapo: "Fresco y sencillo: el compañero ideal para bajar el calor y seguir disfrutando.",
};

export const products: readonly Product[] = catalogProducts.map(product => ({
  ...product,
  price: product.category === "panaderia" ? 2000 : product.id === "guarapo" ? 3000 : 3500,
  description: shortDescriptions[product.id],
}));
