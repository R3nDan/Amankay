"use client";

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type Locale = "es-CO" | "en";

const english: Record<string, string> = {
  "Saltar al contenido": "Skip to content",
  "Navegación principal": "Main navigation",
  "Contáctanos": "Contact us",
  "Inicio": "Home",
  "Amankay, volver al inicio": "Amankay, back to home",
  "Panadería, fritos y bebidas en Neiva.": "Bakery, fried snacks, and drinks in Neiva.",
  "Explora": "Explore",
  "Catálogo": "Menu",
  "Acerca de nosotros": "About us",
  "El oficio del pan": "The craft of bread",
  "Visítanos": "Visit us",
  "Domingos y festivos · Cerrado": "Sundays and holidays · Closed",
  "Lun–vie": "Mon–Fri",
  "Sáb": "Sat",
  "Explora Amankay": "Explore Amankay",
  "Volver arriba ↑": "Back to top ↑",
  "Pan del día.": "Fresh bread today.",
  "Y algo más.": "And a little more.",
  "Ver el proceso": "See how it is made",
  "Ver el catálogo": "Browse the menu",
  "Pide: abrir la bolsa": "Open your bag",
  "productos": "items",
  "Tu bolsa": "Your bag",
  "Cerrar bolsa": "Close bag",
  "Solicitud enviada": "Request sent",
  "La bolsa quedó libre. Amankay confirmará disponibilidad y valor final por WhatsApp.": "Your bag is clear. Amankay will confirm availability and the final price on WhatsApp.",
  "Seguir explorando": "Keep browsing",
  "¿Ya enviaste tu solicitud?": "Did you send your request?",
  "Envía el mensaje preparado en WhatsApp; al confirmar aquí que lo enviaste, liberaremos la bolsa.": "Send the prepared WhatsApp message, then confirm here to clear your bag.",
  "Abrir WhatsApp de nuevo": "Reopen WhatsApp",
  "Sí, ya lo envié": "Yes, I sent it",
  "Subtotal": "Subtotal",
  "Total estimado": "Estimated total",
  "¿Cómo quieres recibirlo?": "How would you like to receive your order?",
  "Recoger": "Pickup",
  "Domicilio": "Delivery",
  "Sucursal para recoger": "Pickup location",
  "Barrio en Neiva": "Neighborhood in Neiva",
  "¿Cómo prefieres pagar?": "How would you like to pay?",
  "Efectivo": "Cash",
  "Transferencia": "Bank transfer",
  "Nombre": "Name",
  "Dirección en Neiva": "Address in Neiva",
  "Referencia para la entrega": "Delivery reference",
  "Domicilios disponibles solo para Neiva, la tarifa es de 2.000 pesos adicionales, y la disponibilidad se confirma al atender su solicitud.": "Delivery is available only in Neiva, with a COP 2,000 fee. Availability is confirmed when your request is reviewed.",
  "Al continuar se abrirá WhatsApp con tu solicitud. Amankay confirmará precio final y disponibilidad antes de aceptar el pedido.": "Continuing opens WhatsApp with your request. Amankay will confirm the final price and availability before accepting the order.",
  "No se pudo registrar el pedido. La bolsa sigue intacta.": "We could not save the order. Your bag is unchanged.",
  "Permite las ventanas emergentes para continuar a WhatsApp; tu pedido no se registró y la bolsa sigue intacta.": "Allow pop-ups to continue to WhatsApp. Your order was not saved and your bag is unchanged.",
  "Enviar solicitud por WhatsApp": "Send request on WhatsApp",
  "Registrando pedido…": "Saving your order…",
  "Tu bolsa espera algo rico.": "Your bag is waiting for something delicious.",
  "Explorar el catálogo": "Browse the menu",
  "ESPACIO DEL EQUIPO": "TEAM WORKSPACE",
  "Bienvenido": "Welcome",
  "de nuevo.": "back.",
  "Ingresa con tu cuenta de personal para continuar la jornada.": "Sign in with your staff account to continue.",
  "Correo electrónico": "Email address",
  "Contraseña": "Password",
  "Entrando…": "Signing in…",
  "Entrar al panel": "Open dashboard",
  "Volver al sitio público": "Back to the public site",
  "Amankay, inicio del panel": "Amankay, dashboard home",
  "Espacio de trabajo": "Workspace",
  "Panel administrativo": "Admin panel",
  "Pedidos": "Orders",
  "Inventario": "Inventory",
  "Reposiciones": "Restocking",
  "Entregas": "Deliveries",
  "Pagos": "Payments",
  "Conciliaciones": "Reconciliation",
  "Usuarios": "Users",
  "Sucursales": "Locations",
  "Reportes": "Reports",
  "Mesas y QR": "Tables & QR",
  "Sucursal": "Location",
  "Cerrar sesión": "Sign out",
  "Preparando tu espacio…": "Preparing your workspace…",
  "Reintentar": "Try again",
  "de la mesa": "for this table",
  "Panadería": "Bakery",
  "Fritos": "Fried snacks",
  "Bebidas": "Drinks",
  "Precio unitario": "Unit price",
  "Total · ": "Total · ",
  "unidad": "unit",
  "unidades": "units",
  "Quitar uno": "Remove one",
  "Agregar uno": "Add one",
  "No hay productos disponibles por ahora.": "No products are available right now.",
  "Idioma": "Language",
  "Los buenos momentos": "Good moments",
  "se comparten.": "are shared.",
  "Pronto, en imágenes.": "Photos coming soon.",
  "Ver ": "View ",
  " y agregar a la bolsa": " and add to bag",
  "Cantidad de ": "Quantity of ",
  "Categorías": "Categories",
  "Preparando tu mesa…": "Preparing your table…",
  "Tu mesa te espera.": "Your table is ready.",
  "Pide al personal que abra la sesión y te muestre el QR temporal de acceso.": "Ask a staff member to open the session and show you its temporary access QR code.",
  "Pedido enviado. El equipo confirmará su preparación.": "Order sent. The team will confirm it shortly.",
  "No se pudo comprobar la mesa.": "We could not verify this table.",
  "No se pudo actualizar la mesa.": "We could not refresh this table.",
  "No se pudo enviar el pedido.": "We could not send the order.",
  "Todos": "All",
  "Aún no hay pedidos asociados a esta mesa. Cuando envíes uno, podrás seguir aquí su estado y total.": "There are no orders for this table yet. Once you place one, you can check its status and total here.",
  "Ver pedido": "View order",
  "Revisar pedido": "Review order",
  "Cerrar resumen": "Close summary",
  "Tu pedido.": "Your order.",
  "Enviar a la mesa": "Send to the table",
  "Enviando…": "Sending…",
  "Pendiente de confirmación": "Awaiting confirmation",
  "Aceptado": "Accepted",
  "En preparación": "Being prepared",
  "Listo": "Ready",
  "Completado": "Completed",
  "Rechazado": "Declined",
  "Cancelación solicitada": "Cancellation requested",
  "Cancelado": "Cancelled",
  "Vencido": "Expired",
  "Nuestro": "Our",
  "catálogo.": "menu.",
  "Panadería, fritos y bebidas para elegir lo que más se te antoje.": "Bakery, fried snacks, and drinks for whatever you are craving.",
  "Ver panadería": "Explore the bakery",
  "Ver fritos": "Explore fried snacks",
  "Ver bebidas": "Explore drinks",
  "Horario de atención": "Opening hours",
  "Horario": "Hours",
  "Lunes a viernes": "Monday to Friday",
  "Sábados": "Saturdays",
  "Domingos y festivos": "Sundays and holidays",
  "Cerrado": "Closed",
  "Teléfono": "Phone",
  "Pedido ": "Order ",
  "Actualizar": "Refresh",
  "Escribir por WhatsApp a ": "Message ",
  "Sede principal": "Main location",
  "Sede secundaria": "Secondary location",
  "Pan de queso": "Cheese bread",
  "Croissant": "Croissant",
  "Mojicón de bocadillo": "Guava-paste sweet roll",
  "Pan hawaiano": "Hawaiian bread",
  "Pan de salchicha": "Sausage roll",
  "Pan agridulce": "Sweet-and-savory bread",
  "Mojicón de queso": "Cheese sweet roll",
  "Mojicón de arequipe y queso": "Caramel and cheese sweet roll",
  "Empanada": "Empanada",
  "Arepa de huevo": "Egg-filled arepa",
  "Pastel de carne": "Beef pastry",
  "Pastel de chorizo": "Chorizo pastry",
  "Pastel de huevo": "Egg pastry",
  "Pastel mixto": "Mixed-fill pastry",
  "Pastel de pollo": "Chicken pastry",
  "Avena": "Oat drink",
  "Sevillana": "Sevillana drink",
  "Guarapo": "Guarapo",
  "Miga tierna y dorado apetitoso: un clásico para disfrutar sin afán.": "Soft crumb and a golden finish: a classic to enjoy at your own pace.",
  "Capas delicadas, exterior dorado y forma de media luna irresistible.": "Delicate layers, a golden exterior, and an irresistible crescent shape.",
  "Suave por dentro, doradito por fuera y con el dulce sabor del bocadillo.": "Soft inside, golden outside, with the sweet taste of guava paste.",
  "Un pan suave y dorado, perfecto para darle un toque especial a la pausa.": "A soft, golden bread to make your break a little more special.",
  "Pan suave con salchicha: práctico, sabroso y listo para disfrutar.": "Soft bread with sausage: handy, tasty, and ready to enjoy.",
  "Un bocado de contraste entre notas dulces y saladas, con miga suave.": "A soft bite with a balance of sweet and savory notes.",
  "Mojicón dorado con queso: pequeño, suave y lleno de sabor.": "A golden cheese roll: small, soft, and full of flavor.",
  "El encuentro del arequipe y el queso en un mojicón tierno y doradito.": "Caramel and cheese come together in a tender, golden roll.",
  "Masa crujiente, forma clásica y un relleno que invita a otro mordisco.": "Crisp pastry, a classic shape, and a filling that calls for another bite.",
  "Arepa dorada y crujiente, con huevo en el corazón de cada bocado.": "A crisp, golden arepa with egg at the heart of every bite.",
  "Masa doradita y relleno de carne: un frito contundente para cualquier pausa.": "Golden pastry with a hearty beef filling for any break.",
  "Crujiente por fuera y con el sabor intenso del chorizo en su interior.": "Crisp outside, with the bold flavor of chorizo inside.",
  "Una cubierta dorada guarda un relleno sencillo y sabroso de huevo.": "A golden crust wraps a simple, savory egg filling.",
  "Una mezcla de sabores envuelta en masa crujiente, ideal para abrir el apetito.": "A mix of flavors wrapped in crisp pastry, perfect for whetting your appetite.",
  "Pollo envuelto en una masa dorada y crujiente, perfecto para cualquier pausa.": "Chicken wrapped in golden, crisp pastry, perfect for any break.",
  "Suave y refrescante, acompaña muy bien una pausa con pan o algo frito.": "Smooth and refreshing, it pairs well with bread or a savory snack.",
  "Una bebida tradicional, fresca y lista para acompañar tus antojos.": "A traditional, refreshing drink to go with your favorite bite.",
  "Fresco y sencillo: el compañero ideal para bajar el calor y seguir disfrutando.": "Fresh and simple: a lovely way to cool down and keep enjoying your day.",
  "¿Qué se te ": "What are you ",
  "antoja hoy?": "craving today?",
  "Explorar categorías": "Explore categories",
  "Pan de queso recién horneado": "Freshly baked cheese bread",
  "Empanada dorada": "Golden empanada",
  "Avena servida en vaso": "Oat drink served in a cup",
  "Panes, croissants y mojicones.": "Breads, croissants, and sweet rolls.",
  "Cortezas doradas, miga suave y algo rico para compartir.": "Golden crusts, soft crumbs, and something lovely to share.",
  "Empanadas y pasteles.": "Empanadas and savory pastries.",
  "Empanadas y pasteles: descubre esta parte de nuestra selección.": "Empanadas and savory pastries: discover this part of our menu.",
  "Avena, sevillana y guarapo.": "Oat drinks, sevillana, and guarapo.",
  "Avena, sevillana y guarapo para acompañar tu elección.": "Oat drinks, sevillana, and guarapo to go with your choice.",
  "Acerca de ": "About ",
  "nosotros.": "us.",
  "Un lugar para encontrarnos alrededor de algo rico.": "A place to come together over something delicious.",
  "En Amankay reunimos panes, fritos y bebidas para distintos momentos del día. Nuestra sede principal está en el centro de Neiva; aquí puedes conocer lo que ofrecemos y elegir lo que más se te antoje.": "At Amankay, we bring together breads, savory snacks, and drinks for every part of the day. Our main location is in downtown Neiva; explore our menu and choose what you are craving.",
  "Conoce nuestra sede": "Find our location",
  "Así toma": "How bread",
  "forma": "takes",
  "el pan.": "shape.",
  "Video en bucle del proceso de elaboración del pan": "Looping video of the bread-making process",
  "No se pudo cargar el video.": "The video could not be loaded.",
  "Abrir el clip directamente": "Open the clip directly",
  "Textura de ": "Decorative pattern for",
  "Agregar a la bolsa": "Add to bag",
  "Buen día,": "Good morning,",
  "TU JORNADA EN AMANKAY": "YOUR DAY AT AMANKAY",
  "Información actual de tu operación en ": "Current operational information for ",
  "Actualizando…": "Updating…",
  "Datos de la API": "Live API data",
  "OPERACIÓN": "OPERATIONS",
  "ACCESO": "ACCESS",
  "Selecciona una sucursal para comenzar.": "Select a location to get started.",
  "Atender pedidos": "Handle orders",
  "Todo en su lugar.": "Everything in its place.",
  "Tu cuenta muestra las áreas de sus roles. Java vuelve a comprobar los permisos y la sucursal en cada operación.": "Your account shows the areas allowed by your roles. Java rechecks permissions and location for every operation.",
  "Gestionar mesas": "Manage tables",
  "Atención en este momento": "Needs attention now",
  "Por confirmar": "Awaiting confirmation",
  "Más de 3 minutos": "Over 3 minutes",
  "Mesas con sesión": "Tables with an active session",
  "Entregas en curso": "Deliveries in progress",
  "Inventario y reposiciones": "Inventory and restocking",
  "Productos con inventario": "Products with stock",
  "Con 5 unidades o menos": "5 units or fewer",
  "Reposiciones en curso": "Restocking in progress",
  "El umbral de 5 unidades es una referencia visual del tablero; no cambia las reglas de inventario.": "The 5-unit threshold is a visual dashboard reference; it does not change inventory rules.",
  "Mis entregas": "My deliveries",
  "Asignadas o en camino": "Assigned or in transit",
  "Desde aquí podrás acceder a la configuración y los reportes autorizados para tu rol.": "From here you can access the settings and reports allowed for your role.",
  "Manos amasando la masa sobre una mesa enharinada": "Hands kneading dough on a floured table",
  "Manos dando forma a una pieza de masa": "Hands shaping a piece of dough",
  "Panes dorados dentro del horno": "Golden bread inside the oven",
  "Panes recién horneados listos para compartir": "Freshly baked bread ready to share",
  "Este acceso temporal corresponde a otra mesa.": "This temporary access belongs to a different table.",
  "No se pudo cerrar la sesión.": "Could not sign out.",
  "No se pudo cargar el tablero.": "Could not load the dashboard.",
  "La sesión no está disponible.": "The session is unavailable.",
};

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (text: string) => string; formatDate: (value: string | Date) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es-CO");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("amankay-locale");
    } catch { /* The selected language still works for this visit when storage is blocked. */ }
    queueMicrotask(() => {
      if (saved === "en" || saved === "es-CO") setLocaleState(saved);
      setReady(true);
    });
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    if (ready) {
      try { localStorage.setItem("amankay-locale", locale); }
      catch { /* The selected language still works for this visit when storage is blocked. */ }
    }
  }, [locale, ready]);
  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale: (next) => setLocaleState(next),
    t: (text) => locale === "en" ? english[text] ?? text : text,
    formatDate: (value) => new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-CO", { dateStyle: "medium", timeStyle: "short" }).format(value instanceof Date ? value : new Date(value)),
  }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider is missing");
  return value;
}

export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.blur();
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const toggle = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setOpen(value => !value);
  };
  const selectLocale = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  return <div
    ref={root}
    className={`language-switch ${open ? "is-open" : ""} ${className}`}
    role="group"
    aria-label={t("Idioma")}
    onMouseEnter={() => { if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setOpen(true); }}
    onMouseLeave={() => { if (!root.current?.contains(document.activeElement)) setOpen(false); }}
    onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setOpen(true); }}
    onBlur={event => { if (!root.current?.contains(event.relatedTarget as Node | null)) setOpen(false); }}
  >
    <div className="language-switch-options" id={id}>
      <button className="language-switch-option" type="button" lang="es-CO" aria-label="Español (Colombia)" aria-pressed={locale === "es-CO"} onClick={() => selectLocale("es-CO")}>ES</button>
      <button className="language-switch-option" type="button" lang="en" aria-label="English" aria-pressed={locale === "en"} onClick={() => selectLocale("en")}>EN</button>
    </div>
    <button ref={trigger} className="language-switch-tab" type="button" aria-label={t("Idioma")} aria-expanded={open} aria-controls={id} onClick={toggle}>
      <span aria-hidden="true">{locale === "en" ? "EN" : "ES"}</span><ChevronDown size={13} aria-hidden="true" />
    </button>
  </div>;
}
