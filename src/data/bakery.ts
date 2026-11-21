export type Product = {
  name: string; category: "Clásicos" | "Dulces"; photo: string; description: string; price: number;
};

// Selección y precios de muestra para la primera entrega visual.
export const products: readonly Product[] = [
  { name: "Pan blandito", category: "Clásicos", photo: "blandito", description: "Capas tiernas, corteza dorada y una miga que se abre con las manos.", price: 2500 },
  { name: "Pan de leche", category: "Clásicos", photo: "leche", description: "Redondo y suave, con una miga fina para acompañar el café.", price: 3000 },
  { name: "Pan azucarado", category: "Dulces", photo: "azucar", description: "Un bollo esponjoso con una cubierta crujiente de azúcar.", price: 3500 },
];

export const stages = [
  { title: "Amasar", image: "masa", alt: "Manos amasando sobre una mesa enharinada", description: "Harina, agua y el movimiento de las manos hasta que la masa se vuelve elástica." },
  { title: "Dar forma", image: "forma", alt: "Una tira de masa enrollada a mano", description: "La masa se divide, se enrolla y descansa en la bandeja." },
  { title: "Hornear", image: "horno", alt: "Panecillos dorándose en una bandeja dentro del horno", description: "El calor levanta la miga y le da a la corteza su tono dorado." },
  { title: "Compartir", image: "hornada", alt: "Pan recién abierto con la miga a la vista", description: "Al salir del horno, el pan reposa. Al partirlo aparece la miga." },
] as const;
