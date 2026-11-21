# Diseño UI/UX de Amankay

## Objetivo y dirección

Diseñar tres experiencias diferenciadas dentro de una aplicación web: un sitio público atractivo, un pedido QR centrado en móvil y un panel operativo rápido y claro. La identidad visual debe servir al negocio de comidas sin inventar que Amankay y El Alambique sean la misma marca. El nombre comercial sigue pendiente; mientras tanto, usar Amankay como nombre del sistema y conservar el logo recibido como referencia, sujeto a confirmar titularidad/uso.

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

El usuario autorizó usar el SVG recibido y sus colores en el prototipo. Conservar su proporción y centrarlo en la cabecera, sin añadir el texto «Amankay» junto a él. El título de pestaña es únicamente «Amankay». Esto no resuelve la identidad comercial definitiva ni la relación con El Alambique. Usar fotografía solo donde ayude a comprender comida, sucursal o promoción.

### Componentes reutilizables

- Botones: primario sólido, secundario bordeado, texto/enlace y destructivo. Altura táctil recomendada mínima 44px.
- Campos: etiqueta persistente, ayuda, requerido visible, error asociado al campo; no depender de placeholder.
- Tarjeta de producto: foto con proporción estable, nombre, descripción breve, precio COP y acción clara.
- Tabla: encabezados legibles, alineación numérica, estado textual y controles compactos; en teléfono, pasar a tarjetas o filas desplazables accesibles según contenido.
- Diálogo: confirmar acciones irreversibles; foco contenido y retorno al control que lo abrió.
- Badge: estado con texto e icono, no solo color.
- Toast/notificación: confirmación breve; errores importantes quedan visibles junto al contexto.
- Navegación pública: cabecera sticky de dos niveles, visible al desplazarse. Logo centrado arriba; debajo, `INICIO`, `PANADERÍA`, `FRITOS`, `BEBIDAS`, con indicador de página activa. El indicador cambia con una transición suave; al hacer clic, el enlace se comprime y recupera su forma como confirmación táctil. Se respeta `prefers-reduced-motion`. Accesos secundarios a sucursales y catálogo a los lados del logo; en móvil se mantienen las cuatro categorías visibles. La franja de categorías usa 45 px en escritorio y 44 px en móvil para liberar espacio sin reducir el área táctil. QR y panel conservan su navegación propia.

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
| QR permanente → `/mesa/[codigoQR]` | Cliente en mesa | El código identifica mesa y sucursal, pero no autoriza pedidos por sí solo. El servidor valida sesión activa y habilita el token temporal. | Catálogo, navegación táctil y carrito; solo personal autorizado puede abrir sesión. |
| Carrito y confirmación | Enviar pedido asociado a cuenta | Líneas, cantidades y confirmación | Controles grandes, resumen y confirmación inequívoca. |
| Pedido enviado | Consultar resultado/estado | Estado de cada pedido | Lista de pedidos de la sesión; enlaza a catálogo y cuenta si permitido por SRS. |
| Token inválido/sesión cerrada | Evitar pedido fuera de sesión | Mensaje claro y ayuda para llamar al personal | Estado de error sin reintento engañoso. |

La experiencia prioriza una mano, carga rápida, pocos pasos y lectores de pantalla. La ruta usa el código QR permanente para identificar mesa/sucursal; tras validar sesión activa se habilita el token temporal y cerrar sesión lo invalida. El cliente no puede abrir sesiones.

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
- Respetar `prefers-reduced-motion`; animaciones de transición breves solo para continuidad, confirmación o navegación. Evitar parallax pesado, autoplay y 3D en flujos de pedido/panel.
- Imágenes optimizadas, tamaños reservados para evitar saltos, lazy loading fuera del primer viewport y texto alternativo según finalidad.

## Flujos a diseñar antes de desarrollo

1. Recoger: catálogo → carrito → sede/modalidad → datos necesarios → confirmación → seguimiento.
2. Domicilio: catálogo → carrito → dirección y contacto → sede responsable según reglas SRS → confirmación → seguimiento/entrega.
3. QR: QR permanente → token de sesión válido → catálogo → carrito → envío → estados del pedido/cuenta.
4. Atención/preparación: cola → detalle → decisión permitida → cambio de estado → actualización de cliente.
5. Pago: registrar intento → adjuntar comprobante (obligatorio para transferencia, opcional/no requerido para efectivo; máximo uno) → verificar/rechazar → nuevo intento si aplica.
6. Mesa: abrir sesión y cuenta → aceptar pedidos → cerrar sesión → mantener cuenta abierta si falta cobro → cerrar cuenta.
7. Reposición: solicitud → revisión → despacho parcial → recepción vinculada a despacho → seguimiento de pendientes/cierre.
8. Entrega: asignar → recoger → salir → entregar o incidencia → registrar monto declarado y recibido cuando aplique.
9. Devolución: informar incidencia → recibir e inspeccionar obligatoriamente → mantener separado mientras está pendiente → reincorporar solo unidades aptas. Las dañadas/no aptas no vuelven al stock.

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
│ Clip del proceso del pan controlado por scroll               │
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
│             │ [Disponible] [Pendiente inspección]           │
│             ├───────────────────────────────────────────────┤
│             │ Producto │ Disponible │ Pendiente │ Acciones  │
│             │ ...      │ ...         │ ...       │ [Ver]     │
│             ├───────────────────────────────────────────────┤
│             │ Historial: fecha, tipo, cantidad, motivo, actor│
│             │ Movimiento pendiente (no suma al disponible)   │
└─────────────┴───────────────────────────────────────────────┘
```

No hay editar/borrar movimiento original; ajustes se agregan como registros nuevos autorizados. Productos devueltos quedan pendientes de inspección y solo aptos retornan al stock.

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

Recaudo distingue declaración del repartidor y registro de recibido por empleado autorizado, una conciliación por entrega. Si retorna producto, mostrar inspección obligatoria antes de reincorporar unidades aptas.

## Ajuste visual e implementación inicial — 21-11-2026

**Decisiones aprobadas por el usuario:** categorías Panadería, Fritos (empanadas, pasteles, papas) y Bebidas (avena, sevillana); cabecera centrada sin nombre añadido al SVG; título de pestaña «Amankay»; retirar verde y utilizar los colores del logo; sustituir el selector de fotos del pan por un clip que avance y retroceda con el scroll.

**Referencia visual:** [MASA](https://www.somosmasa.com/) y su [catálogo de panadería](https://www.somosmasa.com/categorias/panaderia-y-hojaldres). Se retoman la jerarquía de la cabecera y el protagonismo de las fotografías, con recursos, colores y composición propios. No se incorporan sus funciones comerciales.

**Aplicación:** portada fotográfica amplia; tarjetas con imagen enlazan a Panadería y Fritos; Bebidas conserva un tratamiento tipográfico mientras llegan fotos. Productos destacados usan las imágenes recibidas de panadería; el clip aporta una pausa narrativa; pasos de pedido, presentación sin historia inventada y acceso a sucursales completan la portada. No se muestran direcciones, horarios ni contactos de prueba. Interacciones ligeras: subrayado de navegación, entrada progresiva de contenido y zoom suave de fotografías. Sin librería adicional de animación.

**Recorrido del pan:** utiliza el archivo `Proceso_Del_Pan.mp4` proporcionado, publicado como `/videos/proceso/proceso-del-pan.mp4`. Se mantiene la proporción completa del clip. Dentro de una sección sticky, el desplazamiento define su posición temporal: bajar avanza y subir retrocede. No hay autoplay ni captura del scroll. Se ofrecen control manual y enlace para saltar el recorrido; con movimiento reducido se inicia en modo manual, y el usuario puede activar explícitamente el scroll. El video no necesita audio para comprenderse. Incluye mensaje de carga, alternativa ante error y descripción textual.

**Recursos y contenido:** originales en `assets/originales/`; derivados en `public/imagenes/productos/panaderia/`, `public/imagenes/productos/fritos/`, `public/imagenes/marca/`, `public/imagenes/portada/` y `public/videos/proceso/`. Se integran ocho fotos de Panadería y siete de Fritos, optimizadas como WebP, con los originales preservados. Empanadas y pasteles muestran las variedades de las fotos, incluida arepa de huevo; papas y Bebidas siguen sin fotografía. Los precios y la disponibilidad están por confirmar. No se muestran precios inventados ni se implementan carrito, pago, inventario o reglas transaccionales. Los wireframes operativos anteriores describen el alcance previsto, no funcionalidades ya construidas.
