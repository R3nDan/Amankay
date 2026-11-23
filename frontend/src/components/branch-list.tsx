import { MapPin, Phone } from "lucide-react";
import { branches } from "@/data/branches";

export function BranchList() {
  return <div className="branch-list">
    {branches.map(branch => <article className="branch-card" key={branch.id}>
      <h3>{branch.name}</h3>
      <p className="branch-card-address"><MapPin size={17} aria-hidden="true" />{branch.address}</p>
      <div className="branch-card-hours" aria-label="Horario de atención">
        <span>Horario</span>
        <dl>
          <div><dt>Lunes a viernes</dt><dd>{branch.weekdays}</dd></div>
          <div><dt>Sábados</dt><dd>{branch.saturday}</dd></div>
          <div><dt>Domingos y festivos</dt><dd>{branch.sundaysAndHolidays}</dd></div>
        </dl>
      </div>
      <a className="branch-card-phone" href={`tel:${branch.phone.replace(/[^+\d]/g, "")}`}>
        <Phone size={17} aria-hidden="true" />
        <span>Teléfono<strong>{branch.phone}</strong></span>
      </a>
      <a className="branch-card-whatsapp" href={`https://wa.me/${branch.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label={`Escribir por WhatsApp a ${branch.name}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L4 20l.9-3.7a8.5 8.5 0 1 1 15.6-4.6Z" />
          <path d="M8.4 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4l.8 1.8c.1.3.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .7.5.8 1.3 1.6 2.2 2.1.3.2.5.2.7-.1l.8-.9c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.5 0 .2-.1 1-.7 1.5-.5.5-1.3.7-2 .5-1-.2-2.2-.8-3.4-1.8-1.4-1.2-2.4-2.7-2.7-3.7-.4-1.1.1-2.1.4-2.5Z" />
        </svg>
      </a>
    </article>)}
  </div>;
}
