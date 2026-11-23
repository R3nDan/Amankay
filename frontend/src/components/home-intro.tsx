"use client";

import { useI18n } from "@/lib/i18n";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { BakerySymbolSet } from "@/components/ui/bakery-symbol-pattern";

export function HomeIntro() {
  const { t } = useI18n();
  return <section className="about-section" id="acerca" aria-labelledby="about-title">
    <div className="wrap about-inner">
      <div className="about-heading">
        <p className="about-kicker"><span aria-hidden="true" /> Amankay · Neiva</p>
        <h2 id="about-title">{t("Acerca de ")}<em>{t("nosotros.")}</em></h2>
      </div>
      <div className="about-content">
        <div className="about-symbols" aria-hidden="true"><BakerySymbolSet /></div>
        <p className="about-lead">{t("Un lugar para encontrarnos alrededor de algo rico.")}</p>
        <p>{t("En Amankay reunimos panes, fritos y bebidas para distintos momentos del día. Nuestra sede principal está en el centro de Neiva; aquí puedes conocer lo que ofrecemos y elegir lo que más se te antoje.")}</p>
        <Link className="about-link" href="/#contacto">{t("Conoce nuestra sede")} <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}
