import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Header } from "@/components/site-shell";
import { RouteTransition } from "@/components/route-transition";
import { HomeContent } from "@/components/home-content";
import { CategoryContent } from "@/components/category-content";
import { categories } from "@/data/bakery";
import { OrderProvider } from "@/components/order-experience";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amankay",
  description: "Panadería, fritos y bebidas. Descubre nuestro catálogo, el oficio del pan y nuestras sucursales.",
  icons: { icon: "/imagenes/marca/amankay.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es-CO" data-motion="full"><body><OrderProvider>
    <a href="#contenido" className="skip">Saltar al contenido</a>
    <Header />
    <RouteTransition panels={[
      <HomeContent key="inicio" preview />,
      ...categories.map(category => <CategoryContent key={category.slug} slug={category.slug} />),
    ]}>{children}</RouteTransition>
    <Footer />
  </OrderProvider></body></html>;
}
