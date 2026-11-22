import { MapPin } from "lucide-react";
import { ActionLink } from "@/components/ui/action-link";
import { BranchList } from "@/components/branch-list";
export default function Branches() {
  return <main id="contenido" className="wrap inner-page branches"><MapPin aria-hidden size={38} strokeWidth={1.3} />
    <h1>Sucursales</h1><BranchList />
    <ActionLink href="/menu">Ver catálogo</ActionLink>
  </main>;
}
