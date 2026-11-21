import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Header } from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amankay",
  description: "Panadería, fritos y bebidas. Descubre nuestro catálogo, el oficio del pan y nuestras sucursales.",
  icons: { icon: "/imagenes/marca/amankay.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es-CO"><body>
    <a href="#contenido" className="skip">Saltar al contenido</a>
    <Header />{children}<Footer />
  </body></html>;
}
