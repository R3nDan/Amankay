"use client";

import Image from "next/image";
import { useState } from "react";
import { Wheat } from "lucide-react";
import { stages } from "@/data/bakery";

export function BreadProcess() {
  const [index, setIndex] = useState(0);
  const stage = stages[index];
  return <section className="process" id="proceso" aria-labelledby="process-title">
    <div className="process-inner wrap">
      <div className="process-copy">
        <Wheat className="gold" aria-hidden size={32} strokeWidth={1.3} />
        <h2 id="process-title">El oficio<br /><em>del pan.</em></h2>
        <p>Cuatro momentos de una hornada. Recorre el proceso paso a paso.</p>
        <div className="steps" role="group" aria-label="Etapas del proceso">
          {stages.map((item, n) => <button key={item.title} onClick={() => setIndex(n)} aria-pressed={n === index}>
            <span>0{n + 1}</span>{item.title}
          </button>)}
        </div>
      </div>
      <figure><div className="step-photo"><Image key={stage.image} src={`/imagenes/${stage.image}.webp`} alt={stage.alt} fill sizes="(max-width: 760px) 90vw, 50vw" /></div>
        <figcaption aria-live="polite"><b>0{index + 1} / 04</b><span>{stage.description}</span></figcaption>
      </figure>
    </div>
  </section>;
}
