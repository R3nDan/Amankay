import { MapPin, Phone } from "lucide-react";
import { branches } from "@/data/branches";

export function BranchList() {
  return <div className="branch-list">
    {branches.map((branch, index) => <article className="branch-card" key={branch.id}>
      <div className="branch-card-top">
        <span className="branch-card-number">SEDE 0{index + 1}</span>
        {branch.demo && <span className="branch-card-demo">Demostración</span>}
      </div>
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
        <span>{branch.demo ? "Contacto general" : "Teléfono"}<strong>{branch.phone}</strong></span>
      </a>
      {branch.demo && <p className="branch-card-note">Datos de prueba para el MVP. Esta sede aún no atiende al público.</p>}
    </article>)}
  </div>;
}
