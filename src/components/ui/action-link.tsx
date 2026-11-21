import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function ActionLink({ href, children, subtle = false }: { href: string; children: ReactNode; subtle?: boolean }) {
  return <Link className={subtle ? "text-link" : "action"} href={href}>{children}<ArrowRight size={17} aria-hidden /></Link>;
}
