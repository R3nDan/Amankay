import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Header } from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Panadería | Amankay", template: "%s | Amankay" },
  description: "Explora el catálogo de panadería, conoce el proceso del pan y consulta las sucursales.",
  icons: { icon: "/imagenes/amankay.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es-CO"><body>
    <a href="#contenido" className="skip">Saltar al contenido</a>
    <Header />{children}<Footer />
  </body></html>;
}
