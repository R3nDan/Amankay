import { RevealSections } from "@/components/reveal-sections";
import { BreadProcess } from "@/components/bread-process";
import { CategoryIndex } from "@/components/category-index";
import { HomeIntro } from "@/components/home-intro";
import { HomeHero } from "@/components/home-hero";
import { BranchList } from "@/components/branch-list";
import { BakerySymbolSet } from "@/components/ui/bakery-symbol-pattern";

export function HomeContent({ preview = false }: { preview?: boolean }) {
  return <main id="contenido" className="home-page">
    {!preview && <RevealSections />}
    <HomeHero />
    <CategoryIndex />
    <BreadProcess preview={preview} />
    <section className="branch-section" id="contacto" aria-labelledby="branches-title">
      <div className="wrap branch-panel">
        <div className="branch-call">
          <div className="category-heading-art" aria-hidden="true"><BakerySymbolSet /></div>
          <h2 id="branches-title"><span>Sucur</span><em>sales</em></h2>
        </div>
        <BranchList />
        <div className="branch-panel-bottom" aria-hidden="true">
          <div className="category-heading-art"><BakerySymbolSet /></div>
        </div>
      </div>
    </section>
    <HomeIntro />
  </main>;
}
