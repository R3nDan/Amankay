import { MapPin } from "lucide-react";
import { ActionLink } from "@/components/ui/action-link";
export const metadata = { title: "Sucursales" };
export default function Branches() {
  return <main id="contenido" className="wrap inner-page branches"><MapPin aria-hidden size={38} strokeWidth={1.3} />
    <h1>Sucursales</h1><p className="lead">Las direcciones y los horarios estarán disponibles cuando se confirmen los datos de las sedes.</p>
    <ActionLink href="/menu">Ver catálogo</ActionLink>
  </main>;
}
