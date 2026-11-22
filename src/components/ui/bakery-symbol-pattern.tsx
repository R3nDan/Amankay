import { Croissant, CupSoda, Wheat } from "lucide-react";

const patternSymbols = [
  Wheat, CupSoda, Croissant, Wheat, Croissant,
  CupSoda, Wheat, Croissant, CupSoda, Wheat,
  Croissant, Wheat, CupSoda, Croissant, Wheat,
  CupSoda, Croissant, Wheat,
];

export function BakerySymbolSet() {
  return <><Wheat strokeWidth={1} /><Croissant strokeWidth={1} /><CupSoda strokeWidth={1} /></>;
}

export function BakerySymbolPattern() {
  const renderTile = (copy: string) => <div className="hero-symbol-tile" key={copy}>
    {patternSymbols.map((Symbol, index) => <span className={`hero-symbol-${index + 1}`} key={`${copy}-${index}`}>
      <Symbol strokeWidth={1.45} />
    </span>)}
  </div>;

  return <div className="hero-symbol-pattern" aria-hidden="true">
    <div className="hero-symbol-track">{renderTile("first")}{renderTile("second")}</div>
  </div>;
}
