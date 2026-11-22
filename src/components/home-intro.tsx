import { ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  { title: "Elige tu pedido", description: "Panadería, fritos y bebidas." },
  { title: "Elige cómo recibirlo", description: "Recoger o domicilio." },
  { title: "Sigue el pedido", description: "Consulta su estado." },
];

export function HomeIntro() {
  return <>
    <section className="order-guide" aria-labelledby="order-guide-title">
      <div className="wrap order-guide-inner">
        <div className="order-guide-heading"><p className="kicker">Pedidos</p>
          <h2 id="order-guide-title">¿Cómo<br /><em>funciona?</em></h2>
          <Link href="/menu" className="text-link">Explorar el catálogo <ArrowRight size={17} aria-hidden /></Link>
        </div>
        <ol className="order-steps">
          {steps.map((step, index) => {
            return <li key={step.title}><span className="order-step-number">0{index + 1}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
              {index < steps.length - 1 && <span className="step-rule" aria-hidden />}
            </li>;
          })}
        </ol>
      </div>
    </section>
  </>;
}
