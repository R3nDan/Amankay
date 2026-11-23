"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer, Header } from "@/components/site-shell";
import { RouteTransition } from "@/components/route-transition";
import { HomeContent } from "@/components/home-content";
import { CategoryContent } from "@/components/category-content";
import { categories } from "@/data/bakery";
import { OrderProvider } from "@/components/order-experience";
import { useI18n } from "@/lib/i18n";

export function AppChrome({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { t } = useI18n();
  if (path.startsWith("/admin") || path.startsWith("/mesa/")) return <>{children}</>;
  return <OrderProvider>
    <a href="#contenido" className="skip">{t("Saltar al contenido")}</a>
    <Header />
    <RouteTransition panels={[
      <HomeContent key="inicio" preview />,
      ...categories.map(category => <CategoryContent key={category.slug} slug={category.slug} />),
    ]}>{children}</RouteTransition>
    <Footer />
  </OrderProvider>;
}
