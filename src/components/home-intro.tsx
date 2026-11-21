import { ArrowRight, MapPin, ShoppingBag, Timer } from "lucide-react";
import Link from "next/link";

const steps = [
  { icon: ShoppingBag, title: "Encuentra tu antojo", description: "Recorre Panadería, Fritos y Bebidas." },
  { icon: MapPin, title: "Elige cómo recibirlo", description: "Recoger en una sucursal o pedir a domicilio." },
  { icon: Timer, title: "Sigue tu pedido", description: "Consulta su estado hasta recibirlo." },
];

export function HomeIntro() {
  return <>
    <section className="order-guide" aria-labelledby="order-guide-title">
      <div className="wrap order-guide-inner">
        <div className="order-guide-heading"><p className="kicker">Un pedido, tres pasos</p>
          <h2 id="order-guide-title">Así de fácil<br /><em>se antoja.</em></h2>
          <Link href="/menu" className="text-link">Explorar el catálogo <ArrowRight size={17} aria-hidden /></Link>
        </div>
        <ol className="order-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return <li key={step.title}><span className="order-step-number">0{index + 1}</span>
              <div className="order-step-icon"><Icon size={21} strokeWidth={1.5} aria-hidden /></div>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
              {index < steps.length - 1 && <span className="step-rule" aria-hidden />}
            </li>;
          })}
        </ol>
      </div>
    </section>
    <section className="editorial-note" aria-labelledby="editorial-title">
      <div className="wrap editorial-note-inner"><span className="editorial-ornament" aria-hidden>✳</span>
        <div><p className="kicker">Panadería · Fritos · Bebidas</p>
          <h2 id="editorial-title">Un buen momento<br />puede empezar <em>por aquí.</em></h2>
          <p>Elige algo para compartir, acompáñalo como más te gusta y encuentra la sucursal que te quede mejor.</p>
          <Link href="/menu" className="text-link">Descubrir el catálogo <ArrowRight size={17} aria-hidden /></Link>
        </div>
        <p className="editorial-aside">UN ANTOJO<br />A LA VEZ.</p>
      </div>
    </section>
  </>;
}
