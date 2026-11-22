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

function BreadShape({ kind }: { kind: "salchicha" | "mojicon" | "queso" | "bolillo" | "trenza" | "croissant" }) {
  if (kind === "croissant") return <Croissant strokeWidth={1.5} />;
  if (kind === "salchicha") return <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 28c0-11 9-19 23-19 15 0 25 8 25 19 0 8-7 14-20 14H24C14 42 7 37 7 28Z"/><path d="M13 28c2 7 7 11 15 12m9 0c-4-6-4-14 2-19 5-4 12-2 15 4"/><path d="M45 26c4-1 8 1 9 5-2 5-7 7-12 6-3-3-3-8 0-10m5 4 3 1M17 20c6-5 15-7 23-5"/></svg>;
  if (kind === "mojicon") return <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M28 7c4-4 9-2 11 2 5-1 9 3 9 8 5 3 5 8 2 12 3 5 0 10-5 11-2 6-8 8-13 5-5 4-11 2-14-2-6 1-10-3-10-8-5-3-5-9-1-13-2-6 2-10 7-10 3-5 9-5 14-5Z"/><path d="M28 20c-7 0-12 5-12 11s5 11 12 11 12-5 12-11-5-11-12-11Zm0 8c-3 0-5 1-5 4 0 2 2 4 5 4s5-2 5-4c0-3-2-4-5-4Z"/><path d="m16 13 4 7m17-8-3 8M9 27l8 3m30-4-8 4M16 42l5-6m17 7-4-7"/></svg>;
  if (kind === "bolillo") return <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 28c1-10 9-19 24-19 16 0 27 8 28 20-3 8-12 12-27 12C16 41 8 37 6 28Z"/><path d="m16 18 8 11m4-16 8 14m4-11 7 12M11 31c10 5 28 7 42 0"/><path d="m18 21 4 2m8-5 4 3m9 0 3 3"/></svg>;
  if (kind === "trenza") return <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 33c-5-5 1-13 8-10-2-8 7-12 12-6 5-7 15-3 13 5 8-1 12 8 6 13-8 7-31 7-39-2Z"/><path d="m20 24 5 10m4-16 5 17m5-16-3 16m8-12-7 11"/></svg>;
  return <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 29c1-11 12-19 26-19s25 8 26 19c0 8-10 13-26 13S6 37 6 29Z"/><path d="m17 16 7 12m6-17 6 16m9-11 5 12M11 31c11 4 31 4 42 0"/><path d="m21 20 4 2m7-7 4 2m9 4 4 2"/></svg>;
}

export function PanaderiaSymbolPattern() {
  const symbols = ["croissant", "mojicon", "bolillo", "salchicha", "trenza", "queso", "croissant", "bolillo", "mojicon", "trenza", "salchicha", "queso", "bolillo", "croissant", "trenza", "mojicon", "queso", "salchicha"] as const;
  return <div className="hero-symbol-pattern bakery-symbol-pattern" aria-hidden="true"><div className="hero-symbol-track">{[0, 1].map(copy => <div className="hero-symbol-tile" key={copy}>{symbols.map((kind, index) => <span className={`hero-symbol-${index + 1}`} key={`${copy}-${index}`}><BreadShape kind={kind} /></span>)}</div>)}</div></div>;
}

function FritoShape({ kind }: { kind: "empanada" | "pastel" | "pastel-corte" | "arepa" | "bunuelito" | "dedito" }) {
  if (kind === "empanada") return <svg viewBox="0 0 64 52" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 38c4-10 12-23 20-30 3-2 7-2 10 1l18 29c1 3-5 7-11 8-12 3-29 1-37-8Z"/><path d="M11 37c3 4 4-1 7 3s4 0 7 3 5-1 8 2 5-2 8 0 5-4 8-3 4-4 6-4"/><path d="M18 31c5-9 10-15 15-18m6 8 8 13"/><circle cx="30" cy="29" r="1"/><circle cx="37" cy="33" r="1"/></svg>;
  if (kind === "pastel") return <svg viewBox="0 0 64 52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 26c0-12 10-21 25-21s25 9 25 21-10 20-25 20S7 38 7 26Z"/><path d="M14 14c-3 4-4 9-4 13 0 12 9 17 22 17M20 10c-4 8-5 22 1 30m8-34c-2 8-2 28 1 39M39 7c2 10 2 28-1 37m9-32c5 9 6 21 1 29"/><path d="m17 18 2 2m-3 9 2 2m8-15 2 2m-2 13 2 2m14-16 2 2m0 14 2 2"/></svg>;
  if (kind === "pastel-corte") return <svg viewBox="0 0 64 52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 25c0-11 9-19 22-19 10 0 17 5 21 12M8 25c0 10 7 18 18 20M37 44c11-1 19-9 19-19 0-3-1-5-2-7"/><path d="M23 15c-7 2-11 10-11 17m31-18c5 6 7 13 5 21"/><path d="M26 13c8-3 20 2 24 11 5 10 0 19-13 21-12 1-21-7-21-17 0-6 4-12 10-15Z"/><path d="M29 20c7-2 15 2 16 9 2 7-3 11-10 11-8 0-13-5-13-11 0-4 2-7 7-9Z"/><path d="M29 26c3-2 9-1 11 3m-12 5 9 2"/></svg>;
  if (kind === "bunuelito") return <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 29c0-10 7-18 17-18s17 8 17 18-7 17-17 17-17-7-17-17Z"/><path d="M16 22c4 2 7 2 10 0s7-2 10 0m-19 14c4-2 7-2 10 0s7 2 10 0m-9-18v18m-9-9h18"/></svg>;
  if (kind === "dedito") return <svg viewBox="0 0 60 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 34c-4-4-3-11 2-15l18-13c5-4 12-2 15 2s2 11-3 15L26 39c-5 4-11 3-14-1Z"/><path d="m19 30 6 7m1-15 7 7m2-15 7 7"/></svg>;
  return <svg viewBox="0 0 60 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 29c0-10 10-18 23-18s23 8 23 18-10 11-23 11S7 39 7 29Z"/><path d="M12 28c8-5 28-5 36 0M20 20c5-3 15-4 21-1"/><path d="M28 17c-3-3-2-7 1-8 4-1 7 4 4 8m-4 0c-3 3-2 6 1 7 4 1 7-4 4-7"/><circle cx="33" cy="15" r="2.2"/></svg>;
}

export function FritosSymbolPattern() {
  const symbols = ["empanada", "pastel", "arepa", "pastel-corte", "dedito", "empanada", "pastel-corte", "arepa", "bunuelito", "pastel", "empanada", "arepa", "pastel", "dedito", "pastel-corte", "empanada", "pastel", "arepa"] as const;
  return <div className="hero-symbol-pattern fritos-symbol-pattern" aria-hidden="true"><div className="hero-symbol-track">{[0, 1].map(copy => <div className="hero-symbol-tile" key={copy}>{symbols.map((kind, index) => <span className={`hero-symbol-${index + 1}`} key={`${copy}-${index}`}><FritoShape kind={kind} /></span>)}</div>)}</div></div>;
}

type DrinkKind = "avena" | "sevillana" | "guarapo" | "jarra" | "botella";

function DrinkShape({ kind }: { kind: DrinkKind }) {
  if (kind === "jarra") return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 16h34l-4 36H18l-5-36Z"/><path d="M47 22h5c5 0 7 4 6 8-1 6-5 8-12 8M13 16c0-4 8-6 17-6s17 2 17 6M17 27c9 3 18 3 27 0"/><path d="M26 37c-3 3-3 6 0 8m8-9c-3 3-3 7 0 9"/></svg>;
  if (kind === "botella") return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M26 8h12v8l4 6v27c0 4-3 7-7 7h-6c-4 0-7-3-7-7V22l4-6V8ZM26 16h12M22 30h20M22 43h20"/><path d="M30 36h4"/></svg>;
  const liquid = kind === "avena" ? <><path d="M17 24c9 3 21 3 30 0M20 36c7 2 17 2 24 0"/><path d="M25 31h1m6 2h1m7-3h1"/></> : kind === "sevillana" ? <><path d="M17 25c9 4 21 4 30 0M20 38c8 3 17 3 24 0"/><path d="m24 18 2 2m7-3 2 2m6 0 2 2m-8 12 2 2"/></> : <><path d="M17 25c10 3 20 3 30 0M20 38c7-2 16 2 24 0"/><circle cx="27" cy="32" r="1.5"/><circle cx="37" cy="34" r="1"/></>;
  return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 19c0-4 8-7 19-7s19 3 19 7l-6 36H19l-6-36ZM13 19c0 4 8 6 19 6s19-2 19-6M38 18 48 5h5M19 55c2 2 7 3 13 3s11-1 13-3"/>{liquid}</svg>;
}

export function BebidasSymbolPattern() {
  const symbols: readonly DrinkKind[] = ["avena", "jarra", "guarapo", "botella", "sevillana", "avena", "guarapo", "jarra", "sevillana", "botella", "avena", "guarapo", "jarra", "sevillana", "botella", "guarapo", "avena", "sevillana"];
  return <div className="hero-symbol-pattern category-symbol-pattern" aria-hidden="true"><div className="hero-symbol-track">{[0, 1].map(copy => <div className="hero-symbol-tile" key={copy}>{symbols.map((kind, index) => <span className={`hero-symbol-${index + 1}`} key={`${copy}-${index}`}><DrinkShape kind={kind} /></span>)}</div>)}</div></div>;
}
