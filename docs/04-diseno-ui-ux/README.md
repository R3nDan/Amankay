# Diseño UI/UX de Amankay

## Objetivo y dirección

Diseñar tres experiencias diferenciadas dentro de una aplicación web: un sitio público atractivo, un pedido QR centrado en móvil y un panel operativo rápido y claro. El usuario confirmó Amankay como nombre del negocio; el nombre El Alambique del anteproyecto queda como referencia histórica. Se utiliza el logo recibido en el prototipo.

Dirección visual: **cocina contemporánea cálida**. Por decisión explícita del usuario del 21-11-2026, se elimina el verde y se utiliza la paleta cálida del logo: cacao, crema, trigo, durazno y cobre. El fondo marfil se conserva y la tinta pasa a marrón oscuro. Fotografía real de producto con luz natural, encuadres cercanos y fondos sobrios. Evitar estética de plantilla SaaS azul; el panel conserva el mismo lenguaje cromático con menor decoración.

## Sistema visual propuesto

### Color

| Token | Color | Uso |
|---|---|---|
| Tinta | `#30231D` | Texto principal, sin matiz verde. |
| Marfil | `#F7F4ED` | Fondo público. |
| Blanco | `#FFFFFF` | Superficies auxiliares. |
| Cacao | `#6B3F2A` | Color dominante del logo; navegación, acciones y sección del proceso. |
| Crema | `#FAF0DD` | Fondos cálidos y texto sobre cacao. |
| Trigo | `#EDD2A5` | Acentos y texto sobre cacao. |
| Durazno | `#E2B28A` | Superficies de acento con texto cacao. |
| Cobre | `#C48359` | Detalles decorativos; usar tinta si contiene texto. |
| Texto secundario | `#746052` | Texto sobre marfil/crema. |
| Rojo semántico | `#B33A35` | Errores y acciones destructivas, acompañado de texto/icono. |

Contrastes calculados con luminancia relativa sRGB, WCAG AA para texto normal (mínimo 4.5:1): cacao/marfil **8.07:1**, cacao/crema **7.84:1**, cacao/trigo **6.06:1**, cacao/durazno **4.63:1**, tinta/cobre **4.87:1**, tinta/marfil **13.82:1**, secundario/marfil **5.40:1**, secundario/crema **5.25:1**, blanco/cacao **8.86:1**, blanco/rojo **5.88:1**. No usar blanco sobre trigo, durazno o cobre para texto normal. El color nunca será la única señal de estado. El verde hoja, la mostaza y la terracota anteriores dejan de formar parte de la dirección visual vigente.

### Tipografía e identidad

Usar una sans legible y disponible localmente para interfaz (por ejemplo, Inter o Geist Sans si el paquete del proyecto lo incluye) y una serif editorial discreta para títulos públicos si la fuente está disponible sin dependencia externa. No descargar fuentes remotas obligatorias. Jerarquía: títulos breves, cuerpo 16px o superior en flujos de cliente, datos tabulares compactos pero legibles en escritorio.

El usuario autorizó usar el SVG recibido y sus colores en el prototipo. Conservar su proporción y centrarlo en la cabecera, sin añadir el texto «Amankay» junto a él. El título de pestaña es únicamente «Amankay», nombre comercial confirmado. Usar fotografía solo donde ayude a comprender comida, sucursal o promoción.

### Componentes reutilizables

- Botones: primario sólido, secundario bordeado, texto/enlace y destructivo. Altura táctil recomendada mínima 44px.
- Campos: etiqueta persistente, ayuda, requerido visible, error asociado al campo; no depender de placeholder.
- Tarjeta de producto: foto con proporción estable, nombre, descripción breve, precio COP y acción clara.
- Tabla: encabezados legibles, alineación numérica, estado textual y controles compactos; en teléfono, pasar a tarjetas o filas desplazables accesibles según contenido.
- Diálogo: confirmar acciones irreversibles; foco contenido y retorno al control que lo abrió.
- Badge: estado con texto e icono, no solo color.
- Toast/notificación: confirmación breve; errores importantes quedan visibles junto al contexto.
- Navegación pública: cabecera sticky de dos niveles, visible al desplazarse. Logo centrado arriba; en las dos esquinas superiores aparecen motivos vegetales sin líneas de marco, también en móvil, ajustados al ancho de la pantalla y a la altura del logo. Debajo aparecen `INICIO`, `PANADERÍA`, `FRITOS`, `BEBIDAS`, con indicador activo que se desliza horizontalmente entre categorías. Solo el apartado actual queda resaltado; pasar el puntero no añade un fondo iluminado. «Contáctanos» lleva a las sucursales de Inicio y «Pide» al catálogo; muestran texto e icono en escritorio e icono en móvil. Los apartados entran con un barrido lateral según su posición respecto al destino; los movimientos se reducen con `prefers-reduced-motion`. En móvil se mantienen visibles las cuatro categorías. La franja usa 45 px en escritorio y 44 px en móvil. QR y panel conservan su navegación propia.

## Experiencias y pantallas

### Sitio público

| Pantalla | Objetivo/usuario | Información y acciones | Componentes y relación |
|---|---|---|---|
| Inicio `/` | Presentar el sistema/negocio al cliente | Propuesta, acceso a menú, sucursales y pedido | Hero fotográfico, CTA, bloques editoriales. No publicar afirmaciones comerciales hasta definir marca. |
| Menú `/menu` | Explorar oferta | Categorías, productos, disponibilidad, agregar al carrito | Categorías accesibles y tarjetas. Pedido web pendiente no reserva stock; revalidar al aceptar. |
| Categoría `/menu/[categoria]` | Explorar una categoría | `panaderia`, `fritos`, `bebidas`; listado filtrado por categoría | Reutiliza tarjetas y navegación. La primera entrega solo presenta el catálogo, sin carrito ni disponibilidad real. |
| Sucursales `/sucursales` | Elegir/consultar sede | Dirección, horarios, contacto | Lista/tarjetas; mapa solo si se aprueba dependencia y necesidad. |
| Pedido `/pedido` | Revisar y completar pedido | Carrito, modalidad recoger/domicilio, datos requeridos, resumen y envío | Solo pedidos web pendientes de confirmación por WhatsApp expiran a los 30 minutos. No aplica a pedidos aceptados ni en preparación. No reservan inventario y se revalida disponibilidad al aceptar. |
| Seguimiento `/seguimiento/[codigo]` | Consultar estado | Estado e información mínima | Línea de progreso accesible, sin exponer datos personales. |

### Interfaz QR

| Pantalla/estado | Objetivo/usuario | Información y acciones | Componentes y relación |
|---|---|---|---|
| QR permanente → `/mesa/[codigoQR]` | Cliente en mesa | El código identifica mesa y sucursal, pero no autoriza pedidos por sí solo. Atención abre la sesión y muestra un QR temporal distinto para acceder. | Catálogo, navegación táctil y carrito; solo personal autorizado puede abrir sesión. |
| Carrito y confirmación | Enviar pedido asociado a cuenta | Líneas, cantidades y confirmación | Controles grandes, resumen y confirmación inequívoca. |
| Pedido enviado | Consultar resultado/estado | Estado de cada pedido | Lista de pedidos de la sesión; enlaza a catálogo y cuenta si permitido por SRS. |
| Token inválido/sesión cerrada | Evitar pedido fuera de sesión | Mensaje claro y ayuda para llamar al personal | Estado de error sin reintento engañoso. |

La experiencia prioriza una mano, carga rápida, pocos pasos y lectores de pantalla. El QR físico permanente identifica mesa/sucursal sin autorizar pedidos. Al abrir la sesión, Java genera un QR temporal que el personal muestra al cliente desde el panel; al escanearlo, el cliente llega a `/mesa/[codigoQR]` y valida el token de sesión. Cerrar la sesión invalida el token inmediatamente; su expiración no cierra la cuenta. El cliente no puede abrir sesiones.

### Panel administrativo y operativo

| Pantalla | Objetivo/usuario | Información/acciones | Componentes y relación |
|---|---|---|---|
| `/admin` | Orientar al trabajador | Resumen y accesos permitidos | Navegación lateral e indicadores del SRS; no mostrar alertas de stock mínimo, pues no hay umbral aprobado. |
| Pedidos | Atender y preparar | Cola por llegada con priorización visual según tiempo de espera; detalle, aceptación/rechazo y estado | Tres minutos es prioridad visual, no expiración ni rechazo automático. Cancelaciones antes de preparación requieren aprobación autorizada. La expiración de 30 minutos solo aplica a pedidos web pendientes de confirmación por WhatsApp. |
| Mesas | Operar QR y cobro | Mesa, sesión y cuenta; abrir/cerrar independientemente | Vista de mesas, acciones claras, aviso si cuenta abierta bloquea nueva sesión. |
| Pagos | Revisar intentos | Método, estado, importe, comprobante, verificación/rechazo/reembolso total | Transferencia requiere comprobante; efectivo no. Máximo uno por intento; reintento crea otro intento. Vista privada y motivo. |
| Inventario | Consultar/ajustar stock | Existencias y movimientos por sucursal | Tabla filtrable, historial, formulario; mostrar movimientos pendientes separados del disponible. |
| Reposiciones | Gestionar abastecimiento | Solicitudes, aprobación, despachos y recepciones aptas/dañadas | Dañadas cuentan como recibidas, pero no aumentan inventario. Mostrar saldos derivados y trazabilidad del cierre/reversa total en la línea; separar cierre previo y posterior al despacho. |
| Entregas | Coordinar reparto | Asignación, estado, incidencias, recaudo declarado/recibido | Lista por estado y permisos; el repartidor solo ve sus propias entregas. Una conciliación por entrega: repartidor declara y empleado autorizado registra lo recibido. |
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
- Respetar `prefers-reduced-motion`; detener animaciones decorativas, evitar desplazamientos automáticos y dejar el video pausado con controles disponibles cuando el sistema solicite menos movimiento. Evitar parallax pesado y 3D en flujos de pedido/panel.
- Imágenes optimizadas, tamaños reservados para evitar saltos, lazy loading fuera del primer viewport y texto alternativo según finalidad.

### Implementación vigente de internacionalización y accesibilidad

- La internacionalización se implementa en JavaScript, sin biblioteca de traducción externa: diccionarios explícitos para los textos y las API nativas `Intl` para fechas, números y moneda. Los locales disponibles son español de Colombia (`es-CO`), inglés (`en`) y portugués de Brasil (`pt-BR`).
- El selector existente conserva su diseño compacto en la esquina superior derecha de la cabecera pública y del acceso del personal. Su pestaña usa fondo cacao y texto crema; se abre al pasar el cursor en escritorio y al tocarlo en pantallas táctiles. Permite elegir cualquiera de los tres idiomas, guarda la preferencia en `localStorage` y actualiza el atributo `lang` del documento. El botón de ingreso del panel centra su texto y no usa flecha decorativa.
- Los textos del sitio público, el flujo QR, el inicio de sesión, la navegación compartida y el inicio del panel usan los tres locales. Las pantallas operativas internas del panel continúan en español, de acuerdo con el alcance actual.
- Hay enlaces para saltar al contenido, foco visible para teclado, etiquetas y nombres accesibles para controles, anuncios de estado en los flujos de pedido y gestión de foco/teclado dentro de los diálogos de bolsa y carrito QR.
- La preferencia de movimiento reducido desactiva el desplazamiento animado y el video automático; el usuario puede reproducir el video manualmente con controles visibles.
- Esta implementación mejora los criterios técnicos de internacionalización y accesibilidad; no sustituye una auditoría WCAG completa ni una evaluación de usabilidad. La evaluación de usabilidad P-18 sigue pendiente y fuera de este cambio.

## Flujos a diseñar antes de desarrollo

1. Recoger: catálogo → carrito → sede/modalidad → datos necesarios → confirmación → seguimiento.
2. Domicilio: catálogo → carrito → dirección y contacto → sede responsable según reglas SRS → confirmación → seguimiento/entrega.
3. QR: QR permanente → token de sesión válido → catálogo → carrito → envío → estados del pedido/cuenta.
4. Atención/preparación: cola → detalle → decisión permitida → cambio de estado → actualización de cliente.
5. Pago: registrar intento → adjuntar comprobante (obligatorio para transferencia, opcional/no requerido para efectivo; máximo uno) → verificar/rechazar → nuevo intento si aplica.
6. Mesa: abrir sesión y cuenta → aceptar pedidos → cerrar sesión → mantener cuenta abierta si falta cobro → cerrar cuenta.
7. Reposición: solicitud → revisión → despacho parcial → recepción vinculada a despacho → seguimiento de pendientes/cierre.
8. Entrega: asignar → recoger → salir → entregar o incidencia → registrar monto declarado y recibido cuando aplique.
9. Entrega fallida: registrar incidencia en Entrega. La gestión formal de devoluciones e inspecciones queda fuera del MVP; un producto que regrese físicamente no se reincorpora automáticamente al stock disponible.

Estos flujos son inventario de diseño, no implementación ni ampliación del SRS. Confirmar estados y permisos en los documentos de requisitos antes de dibujar prototipos detallados.

## Trazabilidad y operaciones no destructivas

Las pantallas no deben ofrecer acciones para editar o borrar movimientos originales de inventario, despachos, recepciones o conciliaciones ya registradas. Para despachos/recepciones, mostrar la anulación completa (cuando sea segura) y el nuevo registro como hechos separados. Los movimientos compensatorios son nuevos registros; los pendientes aparecen separados del stock disponible. La reversa del cierre se muestra junto al cierre original, conservando sus datos y dejando claro que restaura el saldo. En caso de producto ya consumido, mostrar estado de revisión administrativa sin ajustar stock ni alterar ventas.

## Wireframes de baja fidelidad

Los esquemas son estructura de contenido, no diseño visual final. `[]` representa control; `( )` representa navegación o tab. En móvil las columnas se apilan y las acciones principales permanecen accesibles.

### 1. Inicio público

```text
┌──────────────────────────────────────────────────────────────┐
│ [Sucursales]             [Logo]             [Catálogo]      │
│            INICIO · PANADERÍA · FRITOS · BEBIDAS              │
├──────────────────────────────────────────────────────────────┤
│ [Foto principal de producto / ambiente]  │ Cocina cercana   │
│                                           │ [Explorar menú]  │
├──────────────────────────────────────────────────────────────┤
│ Categorías destacadas / tarjetas de productos               │
├──────────────────────────────────────────────────────────────┤
│ Clip del proceso del pan en bucle, debajo de la navegación   │
├──────────────────────────────────────────────────────────────┤
│ Sucursales y horarios / acceso a información confirmada       │
├──────────────────────────────────────────────────────────────┤
│ Footer: contacto, enlaces y datos confirmados                │
└──────────────────────────────────────────────────────────────┘
```

### 2. Catálogo

```text
┌───────────────────────────────────────────────────────────┐
│ [Sucursales]          [Logo centrado]          [Catálogo]    │
│          INICIO · PANADERÍA · FRITOS · BEBIDAS              │
├───────────────────────────────────────────────────────────┤
│ Menú / sede seleccionada                         [Cambiar] │
│ (Todos) (Panadería) (Fritos) (Bebidas)                      │
├───────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Foto         │ │ Foto         │ │ Foto         │         │
│ │ Nombre       │ │ Nombre       │ │ Nombre       │         │
│ │ Descripción  │ │ Descripción  │ │ Descripción  │         │
│ │ Precio [ + ] │ │ Precio [ + ] │ │ Precio [ + ] │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
└───────────────────────────────────────────────────────────┘
```

### 3. Detalle, carrito y proceso de pedido

```text
┌────────────────────────────────────────────────────────────┐
│ ← Menú                         Tu pedido        [Paso 1/3]  │
├────────────────────────────────────┬───────────────────────┤
│ Producto / presentación             │ Resumen                │
│ [Foto] Nombre                      │ Ítem × cantidad        │
│ Descripción                        │ Subtotal               │
│ Precio                             │ Domicilio (si aplica)  │
│ [−] 1 [+]       [Agregar]          │ Total                  │
│                                    │ [Continuar]            │
├────────────────────────────────────┴───────────────────────┤
│ Paso siguiente: recoger/domicilio → sucursal/dirección →    │
│ datos y confirmación. Pendiente WhatsApp: 30 min; sin reserva│
└────────────────────────────────────────────────────────────┘
```

En móvil, el resumen pasa a panel inferior expandible. Al enviar, el estado pendiente y su expiración se explican sin sugerir que haya reserva; cambios de disponibilidad al confirmar se presentan con opción de revisar el carrito.

### 4. Interfaz de pedidos QR

```text
┌──────────────────────────────┐
│ [Marca]  Mesa identificada   │
│ Sesión activa                │
├──────────────────────────────┤
│ (Menú) (Mis pedidos)         │
│ Categorías                   │
│ ┌──────────────────────────┐ │
│ │ Foto / producto / precio │ │
│ │ [−] cantidad [+]         │ │
│ └──────────────────────────┘ │
│ ...                          │
├──────────────────────────────┤
│ [Ver carrito · total]        │
└──────────────────────────────┘
```

Estados alternos: token/sesión inválidos muestran mensaje y llamada al personal, sin botón de abrir sesión; pedido enviado muestra estado. El QR físico solo identifica mesa/sucursal; servidor exige token temporal válido y sesión activa.

### 5. Panel principal

```text
┌───────────────┬─────────────────────────────────────────────┐
│ Marca         │ Sucursal activa [selector autorizado]      │
│ Inicio        ├─────────────────────────────────────────────┤
│ Pedidos       │ Resumen operativo según SRS                 │
│ Mesas         │ [Pendientes] [En curso] [Accesos frecuentes]  │
│ Pagos         ├─────────────────────┬───────────────────────┤
│ Inventario    │ Cola/actividad       │ Accesos frecuentes   │
│ Reposiciones  │ con tiempos visibles│ [Pedidos] [Mesas]    │
│ Entregas      │                     │ [Inventario]         │
│ ...           │                     │                       │
└───────────────┴─────────────────────┴───────────────────────┘
```

El menú muestra solo módulos autorizados por rol/sucursal. En móvil el lateral se convierte en menú accesible y el selector de sucursal permanece explícito.

### 6. Gestión de pedidos

```text
┌─────────────┬───────────────────────────────────────────────┐
│ Navegación  │ Pedidos [Pendientes] [Preparación] [Todos]    │
│             │ Filtros: sede / tipo / canal / período         │
│             ├───────────────────────┬───────────────────────┤
│             │ Cola por llegada      │ Pedido seleccionado  │
│             │ # código · espera     │ líneas y cantidades  │
│             │ Prioridad visual      │ modalidad / pago     │
│             │ Estado                │ [Aceptar] [Rechazar]  │
│             │ ...                   │ [Actualizar estado]  │
└─────────────┴───────────────────────┴───────────────────────┘
```

La espera destaca visualmente sin expirar/rechazar automáticamente a los tres minutos. Cancelación solicitada antes de preparación incluye decisión del personal autorizado; no aparece como autoacción del cliente una vez iniciada preparación.

### 7. Inventario

```text
┌─────────────┬───────────────────────────────────────────────┐
│ Navegación  │ Inventario       [Sucursal] [Buscar producto] │
│             │ [Disponible]                                   │
│             ├───────────────────────────────────────────────┤
│             │ Producto │ Disponible │ Pendiente │ Acciones  │
│             │ ...      │ ...         │ ...       │ [Ver]     │
│             ├───────────────────────────────────────────────┤
│             │ Historial: fecha, tipo, cantidad, motivo, actor│
│             │ Movimiento pendiente (no suma al disponible)   │
└─────────────┴───────────────────────────────────────────────┘
```

No hay editar/borrar movimiento original; ajustes se agregan como registros nuevos autorizados. La gestión formal de devoluciones e inspección queda fuera del MVP; los productos que regresen físicamente no se reincorporan automáticamente al stock disponible.

### 8. Reposiciones

```text
┌─────────────┬───────────────────────────────────────────────┐
│ Navegación  │ Reposiciones [Solicitudes] [Nueva]            │
│             │ Filtros: estado / solicitante / proveedora     │
│             ├───────────────────────┬───────────────────────┤
│             │ Solicitudes           │ Solicitud / línea     │
│             │ estado · fecha        │ solicitada / aprobada │
│             │                       │ despachada / pendiente│
│             │                       │ apta / dañada / pend. │
│             │                       │ cierre antes/después  │
│             │                       │ [Registrar despacho]  │
│             │                       │ [Registrar recepción] │
└─────────────┴───────────────────────┴───────────────────────┘
```

El detalle muestra cada despacho y su recepción vinculada. Cierre/reversa viven juntos en la línea correspondiente; reversa total conserva el cierre y restaura su saldo. Eventos originales aparecen como solo lectura; anulación completa y nuevo registro se presentan como hechos separados.

### 9. Entregas

```text
┌─────────────┬───────────────────────────────────────────────┐
│ Navegación  │ Entregas [Por asignar] [En curso] [Incidencia]│
│             │ Buscar / filtrar por estado                   │
│             ├───────────────────────┬───────────────────────┤
│             │ Pedido · destino      │ Entrega seleccionada  │
│             │ Repartidor · estado   │ datos mínimos         │
│             │ ...                   │ [Asignar / actualizar]│
│             │                       │ Solo entregas propias │
│             │                       │ Recaudo: declarado    │
│             │                       │ recibido · diferencia │
│             │                       │ motivo / responsable  │
└─────────────┴───────────────────────┴───────────────────────┘
```

Recaudo distingue declaración del repartidor y registro de recibido por empleado autorizado, una conciliación por entrega. Una entrega fallida se registra en Entrega; el retorno físico no activa una inspección ni una reincorporación automática de stock en el MVP.

## Ajuste visual e implementación inicial — 21-11-2026

**Decisiones aprobadas por el usuario:** categorías Panadería, Fritos (empanadas y pasteles en la implementación inicial; papas aplazadas por petición posterior) y Bebidas (avena, sevillana y guarapo); cabecera centrada sin nombre añadido al SVG; título de pestaña «Amankay»; retirar verde y utilizar los colores del logo; sustituir el selector de fotos del pan por un clip que avance y retroceda con el scroll.

**Referencia visual:** [MASA](https://www.somosmasa.com/) y su [catálogo de panadería](https://www.somosmasa.com/categorias/panaderia-y-hojaldres). Se retoman la jerarquía de la cabecera y el protagonismo de las fotografías, con recursos, colores y composición propios. No se incorporan sus funciones comerciales.

**Aplicación:** Inicio usa una composición editorial asimétrica sobre papel cálido `#FAF0DD`, título breve y fotografía en una tarjeta enmarcada. El hero deja solo dos acciones —ver el proceso y el menú—; no muestra rótulo introductorio ni frase promocional. Un patrón más denso y visible de trigo, croissant y bebida reusa los mismos componentes Lucide del encabezado de categorías; sus símbolos aparecen en una distribución irregular y se desplazan continuamente hacia la derecha, reapareciendo por la izquierda sin cubrir las fotografías. Cuatro imágenes generadas y separadas (amasar, dar forma, hornear y pan listo) sustituyen la foto dentro de la misma tarjeta cada 4,2 segundos con una transición lateral breve; la tarjeta no se desplaza con el scroll. Se retiraron dibujos decorativos superpuestos sobre la foto y el botón circular de avance, porque las secciones se alcanzan con scroll. Se retiraron rótulos de colección y avisos repetidos de precios/disponibilidad. El título de categorías queda centrado con los mismos iconos Lucide y líneas decorativas. Debajo de las tarjetas, el botón de catálogo se sustituye por esos mismos tres símbolos centrados entre líneas; el panel no tiene esquinas de marco. Las tarjetas enlazan a Panadería, Fritos y Bebidas al hacer clic y usan inclinación 3D sensible al puntero, brillo y profundidad en dispositivos con cursor. Los símbolos centrados con líneas quedan debajo de esas tarjetas; la cabecera conserva el logo centrado y la navegación de categorías, sin accesos laterales a catálogo o sucursales. Los listados de productos muestran cuatro columnas en escritorio, bajan a tres en pantallas medianas, dos en tablet y dos en móvil; el nombre queda separado de la imagen y en tamaño reducido. No se repite el nombre de la categoría encima de cada producto. Croissant usa la nueva fotografía `Croissant.jpeg`; la foto anterior ya no está en la carpeta de productos. Las tarjetas de categoría muestran una fotografía de producto, incluida Avena en Bebidas, y comparten la superficie cálida, la sombra y el marco blanco que aparece al pasar el cursor en las tarjetas de producto, conservando su inclinación 3D. El bloque destacado «Del horno» de Inicio se sustituyó por las dos tarjetas de sucursales, mientras los panes permanecen en Panadería y el catálogo; el pie conserva el enlace a sucursales.

**Títulos de categoría:** Panadería, Fritos y Bebidas usan cacao `#6B3F2A`, a juego con «Pan del día». Los enlaces de la navbar conservan su color original.

**Fondo de páginas de categoría:** el encabezado usa fondo trigo `#EDD2A5` con textura animada de símbolos crema `#FAF0DD`; el área de productos usa fondo crema beige `#FAF0DD` con puntos sutiles y sin símbolos animados. No altera la navbar ni la disposición del catálogo.

**Encabezado de categoría:** muestra solo el nombre de Panadería, Fritos o Bebidas, sin descripción; su altura se mantiene compacta para acercar el catálogo a la cabecera.

**Contactos y pedidos públicos:** «Contáctanos» en la navbar lleva a las sucursales dentro de Inicio, en el lugar del antiguo bloque «Del horno», que se retira. Las tarjetas muestran las direcciones, horarios y teléfonos de las sedes sin etiquetas de numeración. La sede secundaria se ofrece también como opción de recogida en la bolsa. La ruta `/sucursales` reutiliza las mismas tarjetas. «Pide» permanece a la derecha de la navbar y abre la bolsa del pedido. Desde cada tarjeta se abre el detalle, se elige cantidad y se añade el producto; un símbolo del tipo de producto viaja visualmente a la bolsa, que señala si contiene artículos. La bolsa permite revisar cantidades, subtotal y total estimado, elegir recogida en cualquiera de las dos sedes o domicilio y completar los datos de contacto. Las opciones seleccionadas de modalidad y pago resaltan con fondo cacao y texto crema, con una transición suave de color, elevación y sombra al cambiar de selección. El domicilio está disponible solo para Neiva y suma 2.000 COP por solicitud; la disponibilidad se confirma al atenderla. El botón final muestra solo el icono de la bolsa, centrado, con nombre accesible para lectores de pantalla. El mensaje de WhatsApp se organiza en productos, resumen con total estimado, entrega y datos de contacto, sin emojis; incluye dirección de recogida o de domicilio según la modalidad elegida. El enlace de texto precargado no puede adjuntar el SVG de marca como imagen. Antes de abrir WhatsApp, Java guarda el pedido como pendiente de confirmación manual y con vencimiento a los 30 minutos; no reserva existencias en ese estado. Al volver de WhatsApp, la interfaz solicita confirmación explícita antes de vaciar la bolsa. Si WhatsApp no se abre, el carrito permanece intacto. El personal acepta el pedido desde el panel y entonces se valida disponibilidad y se aplican las reglas de inventario.

**Ajustes visuales posteriores de Inicio:** en escritorio, el segundo verso «Y algo más.» deja hacia la tarjeta de fotos un margen parecido al que «Pan del día.» deja hacia el borde izquierdo; los dos botones quedan centrados en la columna de texto. En móvil, el título principal crece y escalona sus dos versos, seguido de la tarjeta de fotos y los botones centrados debajo. «Así toma / forma / el pan.» también crece, se escalona y se posiciona entre el borde superior del panel y el video solo en móvil. El logo enlaza a `/#inicio`; si ya se está en Inicio y se ha bajado por la página, el contenido recorre verticalmente hacia arriba los paneles hasta llegar a la portada, con la misma profundidad y curva temporal del barrido entre apartados. Los adornos vegetales de la cabecera se acercan más a los bordes en escritorio y conservan su posición móvil. «Sucursales» queda centrado y dividido en dos colores, cacao y cobre, con el mismo tamaño tipográfico que «¿Qué se te antoja hoy?», sin el rótulo «En Neiva» ni línea divisoria encima. La sección reutiliza los tres símbolos del bloque de categorías arriba y abajo, con sus líneas horizontales, sin esquinas de marco. Las tarjetas de sucursal mantienen visible el fondo cálido, la profundidad y el marco blanco elevado; al pasar el cursor conservan una inclinación sutil, sin alterar los datos mostrados.

**Textura por categoría:** cada encabezado conserva el mismo fondo trigo y la misma intensidad de trazo crema. Panadería muestra croissant, pan de salchicha con relleno visible, mojicón en corona, pan de queso con cortes, bolillo y trenza. Fritos muestra empanada triangular con repulgue, pastel frito entero y abierto, arepa de huevo, buñuelo y dedito. Bebidas muestra vasos inspirados en avena, sevillana y guarapo, junto con jarra y botella como motivos decorativos; estos últimos no amplían el catálogo. Los tres patrones se distribuyen con variación y se desplazan horizontalmente.

**Recorrido del pan:** utiliza el archivo `Proceso_Del_Pan.mp4` proporcionado, publicado como `/videos/proceso/proceso-del-pan.mp4`. El MP4 de publicación conserva el video y audio originales mediante remultiplexado sin pérdida y coloca sus metadatos al inicio para facilitar la reproducción progresiva. Una placa con profundidad, inclinación 3D CSS y dibujos SVG abiertos de espigas acompaña el video. La sección ocupa el alto disponible bajo la cabecera fija; el título queda a la izquierda en tres líneas y el panel de video se extiende a la derecha, ambos dentro de una pantalla. Solo este panel se alinea suavemente bajo la navbar cuando el scroll se detiene cerca de él, al acercarse desde arriba o desde abajo; una nueva acción de scroll interrumpe el ajuste y permite continuar, y los demás apartados mantienen su desplazamiento normal. El video se reproduce silenciado y en bucle, sin controles de pausa, reproducción o pantalla completa ni imagen de póster que pueda parecer un fotograma fijo. No se usa el scroll para buscar dentro del video. Si el recurso falla, se muestra una alternativa para abrir el clip.

**Fondos y elementos:** el hero y la sección «Acerca de nosotros» comparten el fondo crema `#FAF0DD`. El antiguo bloque «Cómo funciona» se sustituyó por una presentación editorial de Amankay con datos públicos confirmados, sin inventar historia del negocio ni promesas comerciales.

**Recursos y contenido:** originales en `frontend/assets/originales/`; derivados en `frontend/public/imagenes/productos/panaderia/`, `frontend/public/imagenes/productos/fritos/`, `frontend/public/imagenes/productos/Bebidas/`, `frontend/public/imagenes/marca/`, `frontend/public/imagenes/portada/proceso/` y `frontend/public/videos/proceso/`. Se integran ocho fotos de Panadería y siete de Fritos, optimizadas como WebP, con los originales preservados. Croissant usa la nueva foto `Croissant.jpeg`; Avena, Sevillana y Guarapo muestran sus fotos JPEG nuevas. Empanadas y pasteles muestran las variedades de las fotos, incluida arepa de huevo; Papas se aplaza y no se muestra en el catálogo inicial. Las descripciones del catálogo son breves y evocativas, basadas en los nombres y la presentación visible; no fijan recetas, que siguen pendientes. Los precios indicados por el usuario aparecen en las tarjetas; disponibilidad y recetas siguen pendientes. La bolsa pública ya se integra con la API Java, que registra el pedido antes de abrir WhatsApp. No se procesa el pago en WhatsApp y el canal externo no confirma el envío al sistema; la aceptación del pedido, el pago y las operaciones de inventario siguen las reglas del backend. Los wireframes operativos sirvieron como referencia de diseño; las funciones implementadas y su estado actual se detallan en `docs/05-desarrollo/README.md` y `backend/README.md`.

**Franja de categorías:** las páginas individuales de Panadería, Fritos y Bebidas retiran el título repetido de la franja texturizada. Las franjas superior e inferior tienen un poco más de altura y conservan la misma medida entre sí; el área de productos mantiene su altura. El nombre de cada categoría permanece disponible como encabezado semántico oculto para lectores de pantalla.

**Bolsa de pedidos:** el icono de «Pide» representa una bolsa de papel para pan mediante SVG de líneas sin relleno, coherente con los demás iconos y sin tapa separada. Al añadir un producto, su símbolo se reduce hasta caber en la abertura, viaja suavemente, permanece un segundo visible sobre la bolsa y desciende mientras la boca de papel se abre; después la bolsa recupera su forma inicial. El indicador de contenido es un punto cobre sin contorno, ubicado en la esquina de la bolsa. El símbolo de cada variedad de mojicón distingue su relleno en el detalle y en el recorrido. La preferencia de movimiento reducido omite el vuelo largo.

**Selección de producto (decisión aprobada):** cada tarjeta gira en su lugar sobre su eje vertical con perspectiva 3D, una curva suave simétrica y una elevación breve; también respeta la preferencia de movimiento reducido. La inclinación 3D sensible al puntero continúa activa en ambas caras. El frente muestra foto, nombre y precio en la misma fila; el reverso muestra símbolo blanco dentro de un círculo cacao, nombre, descripción breve, precio unitario, total según cantidad, selector de cantidad y acción de agregar. Los controles de cantidad no disparan el giro. Agregar devuelve la tarjeta al frente y lanza el símbolo hacia la bolsa. Tocar cualquier zona libre del reverso devuelve el frente; los botones y controles conservan su acción. Escape también devuelve el frente. Las franjas texturizadas aumentan ligeramente su altura y comparten el reloj de animación entre páginas y vistas de transición para evitar reinicios.

El símbolo añadido se alinea con el centro de la bolsa: despega de la tarjeta, recorre una curva con un pequeño giro, se detiene sobre la abertura y cae dentro mientras la boca se despliega. El cuerpo de la bolsa responde con una leve compresión y recupera su forma al cerrar.

**Movimiento de navegación:** el indicador activo se anima en posición y ancho dentro de la barra. Al navegar entre Inicio, Panadería, Fritos y Bebidas, las pantallas intermedias se recorren en una tira horizontal según el orden de las categorías, como tarjetas con borde y sombra que revelan el destino; el encabezado fijo conserva su posición. Las otras rutas usan una transición discreta sin dirección de categoría. Las tarjetas de producto y categoría reaccionan al movimiento del puntero con inclinación 3D, iluminación y sombra. Se quitó el botón visible de preferencias de movimiento del pie; las transiciones del prototipo permanecen activas.

**Dependencias visuales:** Motion se usa en las transiciones de navegación; las demás animaciones se implementan con CSS. GSAP, PixiJS con React bindings, Three.js con React Three Fiber/Drei y shadcn CLI se instalaron inicialmente el 21-11-2026, pero se retiraron el 23-11-2026 al confirmar que no tenían imports, componentes ni configuración activa. La ornamentación estática usa SVG por nitidez, accesibilidad y menor costo de ejecución. Esas herramientas podrán añadirse si aparece una escena concreta que lo justifique; cualquier canvas/3D futuro debe cargarse bajo demanda y quedar fuera de los paneles operativos.

**Tarjetas de productos:** las tarjetas de Panadería, Fritos y Bebidas incorporan superficie cálida, sombra y un marco blanco que aparece al pasar el cursor. Conservan la inclinación 3D sensible al movimiento del puntero. Los paneles «¿Qué se te antoja hoy?» y «Sucursales» eliminan únicamente sus esquinas decorativas; conservan símbolos, líneas centrales, contenido y acciones.

**Pie público:** el pie usa fondo cacao, conserva el logo y la frase existente, enlaza al catálogo, a «Acerca de nosotros» y al proceso, y muestra dirección, horario y teléfono de contacto. No inventa enlaces sociales.

**Catálogo completo:** la portada de `/menu` usa un fondo crema estático con puntos finos; no muestra símbolos animados ni el conjunto central de símbolos y líneas encima del título. Cada grupo (Panadería, Fritos y Bebidas) muestra su propio patrón de símbolos en una franja trigo y los productos sobre el mismo fondo crema punteado de su página individual. Los enlaces de categoría usan botones cacao sólidos con texto crema, en armonía con las acciones principales del sitio. Se conservan las tarjetas con profundidad, la distribución de cuatro columnas en escritorio y dos columnas en móvil, y los enlaces a cada categoría.

**Enlace al menú de categoría:** al final de cada listado de Panadería, Fritos y Bebidas aparece el botón cacao «Ver el catálogo», centrado bajo la cuadrícula. En móvil, las tarjetas usan dos columnas y cada fila mantiene sus tarjetas a la misma altura, aunque sus títulos ocupen distinto número de líneas.
