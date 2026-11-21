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
| Terracota accesible | `#A8492E` | Acentos, botones con texto blanco y promociones puntuales. |
| Mostaza | `#D5A642` | Superficie de atención/pendiente con texto tinta. |
| Rojo | `#B33A35` | Errores y acciones destructivas con confirmación. |
| Gris | `#6B716B` | Texto secundario y bordes. |

Contraste calculado según WCAG para texto normal (mínimo AA 4.5:1): tinta sobre marfil 14.34:1 y blanco 15.75:1; blanco sobre verde hoja 7.59:1, terracota accesible 5.74:1 y rojo 5.88:1; tinta sobre mostaza 7.02:1; gris `#6B716B` sobre blanco 5.02:1. Todas estas combinaciones cumplen AA. El terracota original `#B85C3A` con texto blanco daba 4.54:1; se ajustó a `#A8492E` para margen. No usar blanco sobre mostaza ni tinta sobre verde/terracota/rojo para texto normal. Color nunca será la única señal de estado.

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
| Menú `/menu` | Explorar oferta | Categorías, productos, disponibilidad, agregar al carrito | Categorías accesibles y tarjetas. Pedido web pendiente no reserva stock; revalidar al aceptar. |
| Sucursales `/sucursales` | Elegir/consultar sede | Dirección, horarios, contacto | Lista/tarjetas; mapa solo si se aprueba dependencia y necesidad. |
| Pedido `/pedido` | Revisar y completar pedido | Carrito, modalidad recoger/domicilio, datos requeridos, resumen y envío | Formulario por pasos simples; mostrar expiración de 30 minutos para pedidos pendientes según SRS, sin reservar inventario y revalidando disponibilidad al aceptar. |
| Seguimiento `/seguimiento/[codigo]` | Consultar estado | Estado e información mínima | Línea de progreso accesible, sin exponer datos personales. |

### Interfaz QR

| Pantalla/estado | Objetivo/usuario | Información y acciones | Componentes y relación |
|---|---|---|---|
| QR permanente → `/mesa/[token]` | Cliente en mesa | El QR identifica mesa y sucursal, pero no autoriza pedidos por sí solo. Requiere sesión activa y token temporal válido. | Catálogo, navegación táctil y carrito; solo personal autorizado puede abrir sesión. |
| Carrito y confirmación | Enviar pedido asociado a cuenta | Líneas, cantidades y confirmación | Controles grandes, resumen y confirmación inequívoca. |
| Pedido enviado | Consultar resultado/estado | Estado de cada pedido | Lista de pedidos de la sesión; enlaza a catálogo y cuenta si permitido por SRS. |
| Token inválido/sesión cerrada | Evitar pedido fuera de sesión | Mensaje claro y ayuda para llamar al personal | Estado de error sin reintento engañoso. |

La experiencia prioriza una mano, carga rápida, pocos pasos y lectores de pantalla. Cerrar sesión invalida el token temporal. La cuenta acumula pedidos aceptados según regla de negocio; el cliente no puede activar una sesión.

### Panel administrativo y operativo

| Pantalla | Objetivo/usuario | Información/acciones | Componentes y relación |
|---|---|---|---|
| `/admin` | Orientar al trabajador | Resumen y accesos permitidos | Navegación lateral, indicadores del SRS; no inventar métricas. |
| Pedidos | Atender y preparar | Cola por llegada con priorización visual según tiempo de espera; detalle, aceptación/rechazo y estado | Tabla/filtros, indicador de espera, detalle lateral. Tres minutos es prioridad visual, no expiración ni rechazo automático. Cancelaciones antes de preparación requieren aprobación del personal autorizado. |
| Mesas | Operar QR y cobro | Mesa, sesión y cuenta; abrir/cerrar independientemente | Vista de mesas, acciones claras, aviso si cuenta abierta bloquea nueva sesión. |
| Pagos | Revisar intentos | Método, estado, importe, comprobante, verificación/rechazo/reembolso total | Transferencia requiere comprobante; efectivo no. Máximo uno por intento; reintento crea otro intento. Vista privada y motivo. |
| Inventario | Consultar/ajustar stock | Existencias y movimientos por sucursal | Tabla filtrable, historial, formulario; mostrar movimientos pendientes separados del disponible. |
| Reposiciones | Gestionar abastecimiento | Solicitudes, aprobación, despachos y recepciones aptas/dañadas | Dañadas cuentan como recibidas, pero no aumentan inventario. Mostrar saldos derivados y trazabilidad del cierre/reversa total en la línea; separar cierre previo y posterior al despacho. |
| Entregas | Coordinar reparto | Asignación, estado, incidencias, recaudo declarado/recibido | Lista por estado; una conciliación por entrega. El repartidor declara y empleado autorizado registra lo recibido. |
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
│ [Logo / Amankay]       Menú  Sucursales  [Ver menú]          │
├──────────────────────────────────────────────────────────────┤
│ [Foto principal de producto / ambiente]  │ Cocina cercana   │
│                                           │ [Explorar menú]  │
├──────────────────────────────────────────────────────────────┤
│ Categorías destacadas / tarjetas de productos               │
├──────────────────────────────────────────────────────────────┤
│ Sucursales y horarios     │ Cómo pedir / recoger / domicilio │
├──────────────────────────────────────────────────────────────┤
│ Footer: contacto, enlaces y datos confirmados                │
└──────────────────────────────────────────────────────────────┘
```

### 2. Catálogo

```text
┌───────────────────────────────────────────────────────────┐
│ [Logo]  Menú  Sucursales                   [Carrito · n]   │
├───────────────────────────────────────────────────────────┤
│ Menú / sede seleccionada                         [Cambiar] │
│ (Todos) (Categoría) (Categoría) (Categoría)                 │
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
│ Producto / opciones existentes     │ Resumen                │
│ [Foto] Nombre                      │ Ítem × cantidad        │
│ Descripción                        │ Subtotal               │
│ Precio                             │ Domicilio (si aplica)  │
│ [−] 1 [+]       [Agregar]          │ Total                  │
│                                    │ [Continuar]            │
├────────────────────────────────────┴───────────────────────┤
│ Paso siguiente: recoger/domicilio → sucursal/dirección →    │
│ datos y confirmación. Aviso de 30 min y sin reserva stock.   │
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
│ Mesas         │ [Pendientes] [En curso] [Inventario alerta]  │
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
│             │                       │ Recaudo: declarado    │
│             │                       │ recibido · diferencia │
│             │                       │ motivo / responsable  │
└─────────────┴───────────────────────┴───────────────────────┘
```

Recaudo distingue declaración del repartidor y registro de recibido por empleado autorizado, una conciliación por entrega. Si retorna producto, mostrar inspección obligatoria antes de reincorporar unidades aptas.
