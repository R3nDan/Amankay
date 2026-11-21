# Diseño UI/UX de Amankay

## Objetivo y dirección

Diseñar tres experiencias diferenciadas dentro de una aplicación web: un sitio público atractivo, un pedido QR centrado en móvil y un panel operativo rápido y claro. La identidad visual debe servir al negocio de comidas sin inventar que Amankay y El Alambique sean la misma marca. El nombre comercial sigue pendiente; mientras tanto, usar Amankay como nombre del sistema y conservar el logo recibido como referencia, sujeto a confirmar titularidad/uso.

Dirección visual: **cocina contemporánea cálida**. Fondos marfil y crema, texto carbón, acentos verde hoja y terracota para acciones y énfasis. Fotografía real de producto con luz natural, encuadres cercanos y fondos sobrios. Evitar estética de plantilla SaaS azul; el panel conserva el mismo lenguaje cromático con menor decoración.

## Sistema visual propuesto

### Color

| Token | Color | Uso |
|---|---|---|
| Tinta | `#20241F` | Texto principal y navegación oscura. |
| Marfil | `#F7F4ED` | Fondo público. |
| Blanco | `#FFFFFF` | Tarjetas, formularios y superficies. |
| Verde hoja | `#355C45` | Acción primaria y estados positivos. |
| Terracota | `#B85C3A` | Acentos cálidos, promociones puntuales. |
| Mostaza | `#D5A642` | Indicadores de atención/pendiente. |
| Rojo | `#B33A35` | Errores y acciones destructivas con confirmación. |
| Gris | `#6B716B` | Texto secundario y bordes. |

Validar contraste WCAG AA en combinaciones reales; color nunca será la única señal de estado.

### Tipografía e identidad

Usar una sans legible y disponible localmente para interfaz (por ejemplo, Inter o Geist Sans si el paquete del proyecto lo incluye) y una serif editorial discreta para títulos públicos si la fuente está disponible sin dependencia externa. No descargar fuentes remotas obligatorias. Jerarquía: títulos breves, cuerpo 16px o superior en flujos de cliente, datos tabulares compactos pero legibles en escritorio.

Logo proporcionado como activo de marca; no alterar su proporción ni asumir paleta oficial hasta confirmar identidad comercial. Usar ilustración/fotografía solo donde ayude a comprender comida, sucursal o promoción.

### Componentes reutilizables

- Botones: primario sólido, secundario bordeado, texto/enlace y destructivo. Altura táctil recomendada mínima 44px.
- Campos: etiqueta persistente, ayuda, requerido visible, error asociado al campo; no depender de placeholder.
- Tarjeta de producto: foto con proporción estable, nombre, descripción breve, precio COP y acción clara.
- Tabla: encabezados legibles, alineación numérica, estado textual y controles compactos; en teléfono, pasar a tarjetas o filas desplazables accesibles según contenido.
- Diálogo: confirmar acciones irreversibles; foco contenido y retorno al control que lo abrió.
- Badge: estado con texto e icono, no solo color.
- Toast/notificación: confirmación breve; errores importantes quedan visibles junto al contexto.
- Navegación: cabecera pública; navegación inferior/acciones persistentes en QR; lateral plegable en escritorio para panel.

## Experiencias y pantallas

### Sitio público

| Pantalla | Objetivo/usuario | Información y acciones | Componentes y relación |
|---|---|---|---|
| Inicio `/` | Presentar el sistema/negocio al cliente | Propuesta, acceso a menú, sucursales y pedido | Hero fotográfico, CTA, bloques editoriales. No publicar afirmaciones comerciales hasta definir marca. |
| Menú `/menu` | Explorar oferta | Categorías, productos, disponibilidad, agregar al carrito | Categorías accesibles, tarjetas, filtros solo si los requisitos lo justifican; pasa al carrito. |
| Sucursales `/sucursales` | Elegir/consultar sede | Dirección, horarios, contacto | Lista/tarjetas; mapa solo si se aprueba dependencia y necesidad. |
| Pedido `/pedido` | Revisar y completar pedido | Carrito, modalidad recoger/domicilio, datos requeridos, resumen y envío | Formulario por pasos simples, resumen persistente en desktop; errores de disponibilidad claros. |
| Seguimiento `/seguimiento/[codigo]` | Consultar estado | Estado e información mínima | Línea de progreso accesible, sin exponer datos personales. |

### Interfaz QR

| Pantalla/estado | Objetivo/usuario | Información y acciones | Componentes y relación |
|---|---|---|---|
| `/mesa/[token]` válido | Cliente en mesa | Catálogo, categorías, productos y carrito | Cabecera compacta, navegación táctil, CTA fijo de carrito; solo sesión válida. |
| Carrito y confirmación | Enviar pedido asociado a cuenta | Líneas, cantidades y confirmación | Controles grandes, resumen y confirmación inequívoca. |
| Pedido enviado | Consultar resultado/estado | Estado de cada pedido | Lista de pedidos de la sesión; enlaza a catálogo y cuenta si permitido por SRS. |
| Token inválido/sesión cerrada | Evitar pedido fuera de sesión | Mensaje claro y ayuda para llamar al personal | Estado de error sin reintento engañoso. |

La experiencia prioriza una mano, carga rápida, pocos pasos y lectores de pantalla. La cuenta acumula pedidos aceptados según regla de negocio; el cliente no puede activar una sesión cerrada.

### Panel administrativo y operativo

| Pantalla | Objetivo/usuario | Información/acciones | Componentes y relación |
|---|---|---|---|
| `/admin` | Orientar al trabajador | Resumen y accesos permitidos | Navegación lateral, indicadores del SRS; no inventar métricas. |
| Pedidos | Atender y preparar | Cola, detalle, aceptación/rechazo, estado y cancelaciones según autorización | Tabla/filtros, detalle lateral, estados con texto, confirmaciones. |
| Mesas | Operar QR y cobro | Mesa, sesión y cuenta; abrir/cerrar independientemente | Vista de mesas, acciones claras, aviso si cuenta abierta bloquea nueva sesión. |
| Pagos | Revisar intentos | Método, estado, importe, comprobante, verificación/rechazo/reembolso total | Tabla, vista privada del comprobante, motivo y confirmación. |
| Inventario | Consultar/ajustar stock | Existencias y movimientos por sucursal | Tabla filtrable, historial, formulario; mostrar movimientos pendientes separados del disponible. |
| Reposiciones | Gestionar abastecimiento | Solicitudes, aprobación, despachos, recepciones, apto/dañado, cierre/reversa | Vista por solicitud y línea; saldos pendientes derivados; cierre previo/post en contexto correcto. |
| Entregas | Coordinar reparto | Asignación, estado, incidencias, recaudo declarado/recibido | Lista por estado, detalle de entrega y conciliación de efectivo. |
| Productos/categorías | Mantener catálogo | Datos aprobados del producto | Tabla y formulario reutilizable con vista previa de tarjeta. |
| Usuarios | Gestionar accesos | Usuarios, roles y sucursales asociadas | Tabla/formulario; sin permisos individuales. Admin sin permisos operativos heredados. |
| Reportes | Consultar métricas aprobadas | Reportes del alcance SRS | Filtros por periodo/sucursal y tablas/gráficos solo donde agreguen comprensión. |
| Configuración | Mantener sede/horarios/domicilios | Configuración autorizada | Formularios agrupados, validaciones antes de guardar. |

## Estados visuales comunes

- **Carga:** skeletons de tamaño cercano al contenido; evitar bloquear toda la página si solo carga una sección.
- **Vacío:** explicar por qué no hay registros y ofrecer una acción válida si existe.
- **Error:** mensaje humano, contexto preservado y opción de reintento solo cuando sea seguro.
- **Éxito:** confirmación breve con el siguiente estado/acción.
- **Hover/focus:** hover sutil; focus visible de alto contraste y usable con teclado. No esconder información esencial detrás de hover.
- **Deshabilitado:** explicar requisito faltante (por ejemplo, cuenta abierta antes de abrir sesión nueva).

## Responsive, accesibilidad y movimiento

- Diseñar mobile-first para QR y sitio público; panel optimizado para escritorio y usable en tablet/móvil para tareas urgentes.
- HTML semántico, orden de encabezados, navegación por teclado, foco visible, etiquetas asociadas, áreas táctiles cómodas y contraste AA.
- Respetar `prefers-reduced-motion`; animaciones de transición breves solo para continuidad, confirmación o navegación. Evitar parallax pesado, autoplay y 3D en flujos de pedido/panel.
- Imágenes optimizadas, tamaños reservados para evitar saltos, lazy loading fuera del primer viewport y texto alternativo según finalidad.

## Flujos a diseñar antes de desarrollo

1. Recoger: catálogo → carrito → sede/modalidad → datos necesarios → confirmación → seguimiento.
2. Domicilio: catálogo → carrito → dirección y contacto → sede responsable según reglas SRS → confirmación → seguimiento/entrega.
3. QR: QR permanente → token de sesión válido → catálogo → carrito → envío → estados del pedido/cuenta.
4. Atención/preparación: cola → detalle → decisión permitida → cambio de estado → actualización de cliente.
5. Pago: registrar intento → adjuntar comprobante opcional (máximo uno) → verificar/rechazar → nuevo intento si aplica.
6. Mesa: abrir sesión y cuenta → aceptar pedidos → cerrar sesión → mantener cuenta abierta si falta cobro → cerrar cuenta.
7. Reposición: solicitud → revisión → despacho parcial → recepción vinculada a despacho → seguimiento de pendientes/cierre.
8. Entrega: asignar → recoger → salir → entregar o incidencia → registrar monto declarado y recibido cuando aplique.
9. Devolución: informar incidencia → recibir/inspeccionar producto → separar pendiente de inspección → reincorporar solo unidades aptas según SRS.

Estos flujos son inventario de diseño, no implementación ni ampliación del SRS. Confirmar estados y permisos en los documentos de requisitos antes de dibujar prototipos detallados.
