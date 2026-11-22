"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HomeLogoLink() {
  const pathname = usePathname();

  function returnToHome(event: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;

    event.preventDefault();
    window.history.replaceState(window.history.state, "", "/#inicio");
    window.dispatchEvent(new Event("amankay:return-home"));
  }

  return <Link className="signature" href="/#inicio" aria-label="Amankay, volver al inicio" onClick={returnToHome}>
    <Image src="/imagenes/marca/amankay.svg" alt="" width={84} height={88} preload />
  </Link>;
}
