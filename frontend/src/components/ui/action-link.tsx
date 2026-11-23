import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function ActionLink({ href, children, subtle = false, arrow = true }: { href: string; children: ReactNode; subtle?: boolean; arrow?: boolean }) {
  return <Link className={subtle ? "text-link" : "action"} href={href}>{children}{arrow && <ArrowRight size={17} aria-hidden />}</Link>;
}
