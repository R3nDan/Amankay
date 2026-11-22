# Decisiones técnicas y trazabilidad

## Cómo leer este registro

- **Aprobada:** decisión elegida o afirmada directamente por el usuario.
- **Aceptada por continuidad:** el usuario aprobó explícitamente una estructura o recomendación inmediatamente anterior.
- **Propuesta:** sugerencia del asistente sin aprobación explícita identificada.
- **Pendiente:** requiere confirmación o completar análisis.
- **Descartada/sustituida:** una decisión posterior la reemplazó.

## Implementación inicial y ajuste visual aprobado (21-11-2026)

Fuente: instrucciones directas del usuario en este chat, posteriores a la planificación UI/UX. No modifica las decisiones de modelado.

- **Herramientas visuales (21-11-2026):** a petición del usuario, se instalan GSAP, PixiJS/@pixi/react, Three.js/@react-three/fiber/@react-three/drei y shadcn CLI, además de Motion ya existente. Se usan solo donde aporten al sitio público. El adorno actual se implementa como SVG, el plano inclinado del clip con CSS 3D. Evitar cargar motores canvas/3D en toda ruta; dividir bajo demanda. `npm audit` reporta cuatro hallazgos moderados en la cadena de desarrollo de shadcn (sin vulnerabilidades en dependencias de producción).

- **Transiciones de navegación (21-11-2026):** Motion, aceptado en el stack, instalado y aplicado al indicador deslizante de categoría, la respuesta al toque y las transiciones de rutas públicas. El usuario pide una transición tipo tarjeta que se desliza y revela el apartado siguiente, con profundidad y dirección según el orden de la categoría. prefers-reduced-motion reduce la animación. No se altera el comportamiento del video scrub.
- **Portada y ornamentación (21-11-2026):** el usuario pidió un rediseño integral del Inicio con detalle 2D original, vídeo del proceso inclinado y bordado parcialmente con espigas, y menor cantidad de frases. La ilustración es SVG artesanal; perspectiva en CSS; sin inventar precios, horarios o afirmaciones comerciales.

| Tema | Decisión vigente y justificación | Estado |
|---|---|---|
| Desarrollo | El usuario confirmó que análisis y diseño concluyeron, aprobó el MER lógico consolidado y autorizó continuar con el desarrollo del ecosistema. PostgreSQL está instalado localmente según el usuario; la instalación/versiones de Prisma ORM, Prisma Client y el adaptador deben verificarse en el repositorio antes de modificar dependencias. Los pendientes funcionales existentes se resuelven dentro de sus módulos sin reabrir las etapas completadas. | Aprobada, 22-11-2026 |
| Catálogo | Panadería, Fritos y Bebidas. Para la implementación inicial, Fritos comprende empanadas y pasteles; las papas quedan aplazadas por petición posterior del usuario. Bebidas comprende avena y sevillana. Amplía el contenido visual más allá de panes, usando las categorías existentes. | Aprobada; papas futuras |
| Cabecera | SVG centrado, sin texto Amankay adicional, navegación inferior INICIO / PANADERÍA / FRITOS / BEBIDAS. Referencia de jerarquía: MASA. | Aprobada |
| Título y nombre | Amankay es el nombre confirmado por el usuario para el negocio y el título de pestaña de las páginas públicas. Sustituye la duda anterior sobre el nombre comercial del anteproyecto. | Aprobada, 22-11-2026 |
| Paleta | Retirar verde y usar cacao, crema, trigo, durazno y cobre del logo, conservando marfil. Contrastes y usos en UI/UX. Sustituye verde hoja/terracota/mostaza como dirección estética. | Aprobada |
| Accesos públicos | «Contáctanos» conduce a las sucursales dentro de Inicio, en el lugar antes ocupado por «Del horno». «Pide» queda a la derecha de la navbar como acceso al catálogo y, después, al flujo de pedidos. | Aprobada, 22-11-2026 |
| Datos de sucursales | Sede principal: Calle 4 # 5-55, Centro de Neiva. Sede secundaria: Carrera 7 # 19-20, Neiva. Ambas se habilitan como opciones de recogida, con horario compartido (lunes a viernes 6:30 a. m.–6:30 p. m.; sábados 6:30 a. m.–1:00 p. m.; domingos y festivos cerrado) y teléfono 312 586 4045. No mostrar numeración ni etiquetas auxiliares en sus tarjetas. | Actualización directa del usuario, 22-11-2026 |
| Proceso | Video proporcionado, con avance y retroceso mediante scroll. Sustituye las cuatro fotografías seleccionables. | Aprobada |
| Accesibilidad del clip | Movimiento reducido inicia con controles manuales; se puede activar scroll expresamente o saltar el recorrido. Seeks secuenciales, sin capturar desplazamiento; el clip se mantiene independiente de Motion. | Elección técnica dentro de la implementación autorizada |
| Recursos | Originales conservados; fotografías WebP para web, MP4 en carpeta de videos. No reutilizar imágenes de MASA. | Elección técnica dentro de la implementación autorizada |
| Datos comerciales | Fotos de Fritos/Bebidas, precios, recetas y disponibilidad siguen por confirmar. No inferirlos de la referencia. | Pendiente |

### Aprobación del MER e inicio del backend (22-11-2026)

- **MER:** el usuario confirmó que el modelo lógico consolidado de `docs/02-modelado/MER.md` está aprobado. Se sustituye su estado anterior de «pendiente de aprobación»; no se repiten las etapas de análisis y diseño.
- **Desarrollo:** el usuario confirmó que las etapas previas concluyeron y autorizó avanzar con el ecosistema. El backend y la base local todavía no existen; se recomienda iniciar ahora con Prisma/PostgreSQL y entregar primero un flujo vertical de pedidos.
- **Límites:** las decisiones funcionales aún listadas en el SRS y en la matriz de pendientes siguen abiertas; no se inventan ni se consideran bloqueos para implementar módulos cuyo comportamiento ya está definido.

## Desarrollo del pedido público (22-11-2026)

- **Autorización:** el usuario confirmó que ya concluyeron análisis y diseño y pidió implementar el apartado público de pedidos. Sustituye el límite de la primera entrega solo visual. La aprobación no inventa reglas aún pendientes ni equivale a aprobar el MER.
- **Precios aprobados:** Panadería 2.000 COP por producto, Fritos 3.500 COP, Avena y Sevillana 3.500 COP, Guarapo 3.000 COP. Sustituye la parte de «precios por confirmar» en la tabla de implementación inicial; recetas y existencias siguen pendientes.
- **Interacción aprobada:** toque en tarjeta para abrir detalle breve y selector de cantidad; símbolo del tipo de producto animado hacia «Pide» al agregar; bolsa con indicador, resumen y elección entre recogida y domicilio. Las páginas individuales de categoría quitan el título repetido de su franja texturizada y repiten esa franja al final.
- **Ajuste de la bolsa (22-11-2026):** el usuario sustituyó el icono genérico y su tapa animada por una bolsa de papel de pan. El símbolo del producto viaja reducido, espera un segundo sobre la abertura y entra cuando la bolsa se abre por sí misma; el punto de contenido no lleva contorno y queda más cerca de la esquina.
- **Límite actual:** la bolsa local prepara una solicitud en WhatsApp al teléfono de contacto. Sin persistencia, inventario ni confirmación del personal, la interfaz la presenta como solicitud por confirmar, no como pedido creado o aceptado. La formalización de pedidos y seguimiento sigue siendo trabajo pendiente del MVP.

## Decisiones aprobadas para el cierre del modelado (21-11-2026)

- Conservación de eventos originales de despacho y recepción. Corrección mediante anulación completa y registro nuevo cuando las dependencias lo permitan; anulación documental y movimientos compensatorios son operaciones separadas.
- Los movimientos de inventario pendientes no afectan el stock disponible. No se permiten existencias negativas. Si el producto ya fue consumido, se deriva a revisión administrativa sin reescribir ventas ni automatizar deuda, pérdida o regularización.
- Se mantiene un cierre final de faltantes por línea y una reversa total como máximo por cierre. No se admiten reversas parciales ni entidad de cierre independiente si los campos caben en la línea existente.
- Una conciliación por entrega. El repartidor declara el monto y el trabajador autorizado de sucursal registra lo recibido; cualquier rectificación conserva el original y queda vinculada a este.
- Como máximo un comprobante por intento de `Pago`; cada reintento es otro `Pago`.
- Permisos por rol y sucursal con asociaciones existentes. Sin permisos individuales configurables ni doble autorización obligatoria por defecto. El administrador no hereda permisos operativos. El empleado receptor es un trabajador autorizado, no un actor separado. Una persona puede registrar y autorizar operaciones ordinarias.
- Estados de solicitud de reposición: `PENDIENTE_REVISION`, `RECHAZADA`, `EN_PROCESO`, `COMPLETADA`; `BORRADOR` solo si se necesita guardar una solicitud sin enviar. Los saldos pendientes se calculan desde cantidades.

Estas decisiones sustituyen propuestas técnicas previas incompatibles de correcciones por delta, `CierreFaltanteReposicion`, aprobación doble, sesión/cuenta con cierre conjunto y múltiples comprobantes por intento.

Las once conversaciones compartidas se abrieron en navegador y se revisaron. Algunas respuestas estaban colapsadas en la vista; se revelaron con el control de copia y se cotejaron contra los mensajes de usuario posteriores. Se consultaron todas las fuentes siguientes:

1. [Requisitos iniciales y decisiones del MVP](https://chatgpt.com/share/6b01d0a2-035c-83ea-aee5-39db38d3b578)
2. [Actores, casos de uso y validaciones](https://chatgpt.com/share/6b01d0bf-a34c-83ea-a330-a71f677250f8)
3. [Consolidación de casos de uso y reposición por sucursal](https://chatgpt.com/share/6b01d0b0-86d8-83e8-859a-dd93e89cd206)
4. [Recepción parcial y repartos](https://chatgpt.com/share/6b01d0d0-fd70-83e9-b681-8e1f6b1baf3b)
5. [Inspección de productos devueltos](https://chatgpt.com/share/6b01d0da-89f0-83e9-948c-4dd392481859)
6. [Pagos, comprobantes, reembolsos y conciliación](https://chatgpt.com/share/6b01d0e3-468c-83e9-82b3-22dcec98c569)
7. [Clases UML y correcciones de negocio](https://chatgpt.com/share/6b01d0f1-4d10-83e9-a5e7-6e075dedce85)
8. [Diagrama UML consolidado y cardinalidades MER](https://chatgpt.com/share/6b01d103-6fe8-83e9-953e-5403db925930)
9. [Secuencia de fases y aprobación de relaciones MER](https://chatgpt.com/share/6b01d114-7e04-83e9-bb40-c135412f6824)
10. [Stack y costes](https://chatgpt.com/share/6b01d123-58a4-83e9-ba45-329495ddbd6d)
11. [Arquitectura final y ejecución sin costo obligatorio](https://chatgpt.com/share/6b01d131-5274-83e9-953e-5403db925930)

El anteproyecto `AnteProyecto_PW.docx` también se revisó. Contiene datos personales de estudiantes que se omitieron deliberadamente; no son requisitos del sistema.

## Revisión por conversación

1. **Requisitos iniciales:** el usuario pidió documentar el proyecto en Markdown dentro de su carpeta. Definió recogida con sede elegida y recomendación de sede que complete todo el carrito; descuento al aceptar pedido; 30 minutos para pedidos pendientes de confirmación sin retener stock; WhatsApp directo manual; pidió pantalla de espera y una cola que no se bloquee. Después fijó como decisiones finales inventario de productos terminados, sin personalización, varios pedidos de mesa acumulados en la cuenta, cancelación antes de preparar y registro WhatsApp desde el panel. El asistente recomendó FIFO visible con escalamiento (3 minutos sugeridos), token QR temporal y seguimiento sin datos personales innecesarios.
2. **Actores/casos de uso:** el usuario validó cinco actores y casos de uso; indicó “Encargados: one”, “Atención: both”, “Repartidor: delivery”, “Cancelaciones: before”. Aprobó las funcionalidades del cliente. Aprobó opción B para que el administrador no herede de forma automática tareas operativas; permisos adicionales son asignables. El diagrama incluyó historial personal e incidencias del repartidor.
3. **Consolidación UML y reposiciones:** el usuario aprobó estructura general y pidió explicitar el flujo por sucursal: principal revisa/aprueba/prepara/despacha; secundaria solicita/recibe. El asistente dejó esa regla como permisos por sede de un actor único de inventario. También delimitó cancelación condicional, registro manual WhatsApp y descuento de inventario al aceptar.
4. **Recepción y repartos:** el usuario aprobó opción A para recepción parcial, cantidades pendientes y registro de diferencias. Luego pidió continuar con módulo de repartidores/entregas. El asistente recomendó entregar solo pedidos asignados, separación de estados pedido/entrega y revisión de incidencia por atención; la resolución final de incidencias no quedó seleccionada de forma inequívoca.
5. **Devoluciones:** el usuario aprobó el diagrama de pedidos externos y recomendaciones; eligió opción A: inspeccionar obligatoriamente productos devueltos de entregas fallidas antes de reincorporarlos. Se incorporó estado pendiente de inspección, separar ese stock del disponible, registrar responsable/fecha/cantidad/observaciones y devolver a venta solo unidades aptas.
6. **Pagos (historial y corrección vigente):** el chat de pagos respalda borrar el archivo de comprobante rechazado y exigir motivo cuando el efectivo declarado por repartidor difiere de lo recibido. La documentación anterior interpretó incorrectamente el reembolso como parcial; la instrucción directa más reciente corrige esa interpretación: reembolso manual, solo total, con datos dentro de `Pago`. Se mantiene el flujo simple de efectivo, separado del pago al cliente; no se incorpora conciliación avanzada.
7. **Clases y restricciones UML:** el usuario aprobó varias propuestas con respuestas “A”, aprobó recepción con pendientes calculados y cierre autorizado de faltantes, y aprobó `abiertaPor`/`cerradaPor` para sesiones. Aprobó la distinción `tipoActor` para auditoría humana o de sistema. El diagrama base de 20 clases necesitaba estos agregados y restricciones.
8. **Diagrama UML/MER:** se presentó el modelo de clases consolidado y se avanzó a identificar relaciones, PK/FK y multiplicidades. El chat contiene además una petición de continuar con el bloque de entregas/repartidores/incidencias; no convertir esa petición por sí sola en aprobación de cada detalle de diseño.
9. **Relaciones MER:** el usuario corrigió el intento de saltar directamente a crear la base de datos, pidió respetar la secuencia de fases ya acordada y aprobó el bloque 3 de relaciones/cardinalidades para continuar con entidades asociativas, FK y estructura lógica. El MER, por ello, continuaba abierto al terminar el chat.
10. **Stack:** el usuario pidió revisar las dependencias de SpacesApps_2, usar Next.js y TypeScript, comparar MySQL/PostgreSQL y evitar gastos. La idea de migración a Render + Neon aparece como texto redactado en el cuadro de entrada, no como mensaje enviado/decisión adoptada.
11. **Arquitectura/costos:** la respuesta final recomienda Next.js + Route Handlers, Prisma, PostgreSQL local, validación y componentes, y desarrollo/demo local sin costo obligatorio. El usuario pidió continuar con el trabajo. Ningún despliegue público pagado queda como requisito.

## Matriz de conciliación vigente

El resumen de ChatGPT compartido por el usuario el 21-11-2026 se contrastó con los once enlaces y con las decisiones posteriores expresas del proyecto. La siguiente tabla refleja el estado consolidado vigente; no debe leerse como que cada frase aparece literalmente en los once chats.

| Tema | Estado vigente | Regla consolidada | Pendiente real |
| --- | --- | --- | --- |
| Cancelación | Definida | El cliente solicita antes de iniciar preparación; personal autorizado aprueba o rechaza. | Asignar el permiso a roles existentes y definir efecto por estado de stock/pago. |
| Incidencias de entrega | Definida parcialmente | Estado y observaciones dentro de `Entrega`; no entidad `Incidencia`. | Quién autoriza reintento, retorno u otra resolución. |
| Sucursal para domicilio | Definida | Asignación automática por disponibilidad del pedido completo y proximidad; no dividir. | Método técnico de distancia y desempate. |
| Sin sede con pedido completo | Regla mínima definida | No aceptar ni dividir el pedido si ninguna sede puede completarlo. | Presentación UX de alternativas, si aporta valor. |
| Cobertura y tarifa | Definidas para el prototipo | Neiva; 2.000 COP adicionales por domicilio, configurables. | Validación de dirección/cobertura en el flujo real. |
| Nombre comercial | Resuelto | Amankay; El Alambique queda como nombre histórico del anteproyecto. | Ninguno. |
| Entidades | Aprobado | 24 entidades de dominio + `UsuarioRol` y `UsuarioSucursal` = 26. | Ningún cambio de entidades/cardinalidades sin aprobación expresa. |
| Cliente | Definido | No requiere iniciar sesión para consultar o realizar pedidos externos; QR requiere sesión temporal de mesa. | Ninguno para el esquema base. |
| Pagos | Definido parcialmente | Intentos múltiples; máximo un comprobante por intento; reembolso manual total; no sobrepagar. | Si cada intento puede ser parcial; almacenamiento privado del comprobante. |
| Criterios de aceptación | Pendientes de aprobación | Criterios observables redactados en `criterios-aceptacion.md`. | Aprobar métricas, tareas y protocolo académico de usabilidad. |
| Dependencias técnicas | Por verificar | Next.js/TypeScript, PostgreSQL y Prisma son la dirección técnica. | Confirmar paquetes y versiones reales en el repositorio, no asumir que están instalados. |

## Decisiones consolidadas

| Tema | Decisión y fundamento | Estado |
| --- | --- | --- |
| Producto almacenado | Inventario de productos terminados, no ingredientes. | Aprobada |
| Momento de descuento | Al aceptar el pedido; la aceptación y el descuento son atómicos. | Aprobada |
| Personalización | Sin modificaciones de productos en el MVP. | Aprobada |
| Cliente | No necesita cuenta para pedidos externos ni consulta pública; el acceso QR se habilita mediante sesión temporal iniciada por personal. | Aprobada |
| Mesa | Varios pedidos aceptados se acumulan en una cuenta por sesión; cada pedido conserva su revisión individual. | Aprobada |
| Cancelación | El cliente solicita antes de preparación; personal autorizado aprueba/rechaza. | Aprobada; rol exacto pendiente |
| WhatsApp | Pedido recibido por WhatsApp lo registra manualmente el trabajador en el panel. Sin API. | Aprobada |
| Recogida | Cliente elige sede; validar el carrito completo y recomendar una sede que pueda completarlo. | Aprobada |
| Domicilio | Asignación automática según disponibilidad del pedido completo y proximidad; no dividir el carrito. | Aprobada |
| Sin sede disponible | No aceptar ni dividir el pedido si ninguna sede puede completarlo. | Regla mínima consolidada |
| Repartidores | Asignación manual por atención; el repartidor solo consulta/actualiza sus entregas asignadas. | Aprobada |
| Horarios | Configurables por sucursal; horario actual compartido documentado en SRS/UI-UX. | Aprobada |
| Sesión QR | QR permanente identifica mesa/sucursal, no autoriza. Personal abre sesión y se genera token temporal; cerrar sesión invalida token. | Aprobada; duración técnica pendiente |
| Cola | FIFO de presentación; 3 minutos es prioridad visual sugerida, no expiración ni rechazo automático. | Regla de UX documentada |
| Reposición | Secundaria solicita/recibe; principal revisa, aprueba, prepara y despacha. Múltiples despachos y recepciones parciales. | Aprobada |
| Devolución domiciliaria | Inspección obligatoria; solo unidades aptas vuelven a stock disponible. | Aprobada |
| Pagos | Intentos múltiples, máximo un comprobante por intento, verificación manual y sin sobrepago. | Aprobada |
| Reembolsos | Manuales, exclusivamente totales y registrados dentro de `Pago`; no entidad separada. | Aprobada |
| Efectivo de entregas | Una conciliación simple por entrega; repartidor declara y trabajador autorizado registra lo recibido; diferencia requiere motivo. | Aprobada |
| Auditoría genérica | `RegistroAuditoria` solo para acciones administrativas importantes; eventos operativos conservan sus registros propios. | Aprobada |
| Sesión y cuenta de mesa | Relación obligatoria 1:1; se crean juntas y se cierran independientemente. Una cuenta abierta bloquea nueva sesión. | Aprobada |
| Entrega y sucursal | `Entrega` no duplica `sucursalId`; deriva desde el pedido. | Decisión técnica incorporada al MER |
| Reportes | Ventas por sede/periodo, historial/estados de pedidos, inventario/movimientos y reposiciones. Excluir productos más vendidos. | Aprobada |
| Costos | Desarrollo y demostración local sin servicio obligatorio pagado. | Aprobada |
| Fases | Análisis y diseño concluidos; MER aprobado; continuar implementación por etapas. | Aprobada |

## Diferencias entre decisiones y recomendaciones

1. **Permisos de cancelación:** está aprobado que personal autorizado decida la solicitud; falta asignar el permiso a roles existentes. No inferir una jerarquía.
2. **Atención: both:** se conserva como expresión histórica sin interpretación organizativa concluyente. No crear actores/roles nuevos por esa frase.
3. **Incidencias:** está definido el registro simple en `Entrega`; sigue pendiente quién decide reintento/retorno.
4. **Pago parcial:** varios intentos no equivalen a un intento parcial. Falta decidir si un intento puede cubrir menos del saldo. El reembolso parcial sí está descartado.
5. **Despliegue:** Render + Neon no quedó aprobado; el objetivo inicial es ejecución local.
6. **Conteos:** 20 clases y 22/27 candidatas pertenecen a etapas históricas. El conteo vigente aprobado es 24 entidades de dominio + 2 asociativas = 26.
7. **Prisma:** la dirección tecnológica está aprobada, pero la instalación real y las versiones deben verificarse en el repositorio. No asumir la instalación por menciones documentales.

## Bloqueos técnicos antes de la migración inicial

El MER lógico está aprobado, pero estos detalles no deben ser inventados por Codex:

- **Nulabilidad:** revisar cada atributo marcado `?` en `MER.md` y asignar `NOT NULL` o nullable según la regla funcional documentada. Si no puede determinarse, registrar la pregunta en vez de escoger arbitrariamente.
- **Origen de `MovimientoInventario`:** está definido que cada movimiento afecta un `InventarioSucursal`, pero no se ha cerrado cómo referenciar sin ambigüedad el evento que lo origina (aceptación/cancelación de pedido, recepción, devolución inspeccionada, ajuste o compensación). No añadir varias FK redundantes ni una referencia polimórfica sin decisión.
- **Estados de `Pedido` y `Pago`:** sus enums aparecen como atributos, pero el catálogo completo de valores y transiciones no está consolidado en un único lugar. No inventar valores.
- **Unicidades pendientes:** identificador/QR de mesa, nombres de categoría/producto y configuración singleton requieren decisión o regla explícita antes de fijar índices.
- **Tipos físicos:** precisión/escala monetaria, longitudes, defaults, nombres SQL y política de borrado deben documentarse de manera consistente al pasar a Prisma.

Los demás detalles funcionales que no afectan las tablas iniciales pueden resolverse al implementar el módulo correspondiente, manteniendo la matriz de pendientes.

## Decisión definitiva de reposiciones parciales

El usuario confirmó expresamente que la opción aprobada es permitir múltiples despachos y múltiples recepciones parciales por solicitud, sin límite funcional. La simplificación posterior a un despacho y una recepción queda **descartada** y no reemplaza este acuerdo.

1. Una solicitud puede generar varios despachos; cada despacho y sus detalles conservan las cantidades realmente enviadas.
2. Cada recepción se relaciona con el despacho concreto que atiende y registra cantidades recibidas aptas y dañadas.
3. Pendiente de despacho = cantidad aprobada menos suma de cantidades despachadas por detalle, sin permitir resultado negativo.
4. Pendiente de recepción por despacho/detalle = cantidad enviada menos suma de cantidades recibidas vinculadas, sin permitir resultado negativo.
5. Las cantidades dañadas son recibidas físicamente, pero no se agregan al inventario disponible para la venta.
6. Los faltantes definitivos se registran mediante cierre autorizado con motivo, responsable y fecha; no se infieren automáticamente por demora.
7. Despachos y recepciones originales se conservan. Para corregirlos se anula el evento completo y se registra uno nuevo cuando sea seguro; no se usan deltas ni se modifica/borrar el evento original.

Las fórmulas y claves exactas son propuesta para el modelo lógico y quedan sujetas a revisión técnica del MER; las reglas funcionales anteriores están definidas.

## Decisiones consolidadas

| Tema | Decisión y fundamento | Estado |
| --- | --- | --- |
| Producto almacenado | Inventario de productos terminados, no ingredientes; “finished” respondía qué se inventaría. | Aprobada |
| Momento de descuento | El usuario dijo descontar al aceptar pedido; protege de pedidos no aceptados. El diagrama de pedidos repite descuento atómico al aceptar. | Aprobada |
| Personalización | Sin modificaciones de productos en el MVP. | Aprobada |
| Mesa | Varios pedidos aceptados se acumulan en una cuenta de sesión; cada pedido se revisa/acepta individualmente. | Aprobada |
| Cancelación | El cliente solicita antes de empezar preparación. El trabajador autoriza/rechaza fue explicación del asistente, sin confirmación explícita inequívoca. | Ventana aprobada; autoridad pendiente |
| WhatsApp | Pedido directo lo registra manualmente el trabajador en panel de externos. Automatización futura. | Aprobada |
| Recogida | Cliente elige la sede; validar carrito entero; si falta inventario recomendar sede que complete todo. | Aprobada |
| Domicilio | La sede según inventario/proximidad aparece en el UML del asistente, no como decisión explícita del usuario. | Pendiente |
| Repartidores | Asignación manual por atención; el repartidor no se autoasigna y solo ve pedidos propios. | Aprobada |
| Horarios | Configurables por sucursal. | Aprobada |
| Sesión QR | QR permanente identifica mesa/sede pero no autoriza. Personal abre sesión con token temporal, cerrado se invalida. | Aprobada |
| Cola | FIFO de presentación; umbral recomendado de 3 minutos escala a atención prioritaria, no rechazo automático ni bloqueo. | Recomendación; umbral no finalizado |
| Reposición | Secundaria solicita/recibe; principal revisa, aprueba, prepara/ despacha. | Aprobada en flujo solicitado/corregido |
| Recepción | Recepción parcial, cantidades pendientes y diferencias registradas. | Aprobada explícitamente |
| Devolución domiciliaria | Inspección obligatoria antes de reincorporar stock; unidades pendientes separadas, aptas vuelven, no aptas se registran como pérdida. | Opción A elegida y aceptación posterior |
| Pagos rechazados | Eliminar archivo de comprobante rechazado; conservar intento, fecha, estado y motivo. | Aprobada explícitamente |
| Reembolsos | Manuales, exclusivamente totales y registrados dentro de `Pago`; no hay entidad separada ni parcialidad. | Definido en instrucción directa más reciente; sustituye la interpretación anterior |
| Efectivo de entregas | Registrar monto declarado por repartidor y monto recibido por sucursal; motivo obligatorio ante diferencia. Es un flujo simple distinto del pago del cliente; no es conciliación bancaria avanzada. | Aprobada explícitamente en chat 6; conservar en alcance mínimo |
| Auditoría genérica | Limitar `RegistroAuditoria` a acciones administrativas importantes; pagos, inventario, reposiciones y efectivo mantienen registros operacionales propios. | Definido en instrucción directa más reciente |
| Sesión y cuenta de mesa | Relación obligatoria 1:1; crear ambas juntas y cerrar independientemente; impedir nueva sesión mientras siga abierta la cuenta. | Aprobada por el usuario |
| Entrega y sucursal | Omitir `sucursalId` redundante en `Entrega`; derivar desde `Entrega.pedidoId -> Pedido.sucursalId`. | Recomendación técnica de esta revisión |
| Repartidor | Entrega separada del pedido; transición recogido antes de entregado; incidencias recomendadas. | Estados aprobados por continuidad; resolución de incidencia pendiente |
| Reportes | Ventas, pedidos, productos, inventario y reposiciones se agruparon; luego el usuario propuso eliminar productos más vendidos y dijo aprobar lo demás tras revisión. Excluir “productos más vendidos”. | Decisión posterior sustituye alcance anterior |
| Stack | Next.js/React/TypeScript, Tailwind, Motion; PostgreSQL/Prisma/Zod; componentes shadcn y utilidades opcionales. | Dirección aprobada/propuesta aceptada; versiones por verificar |
| Costos | Desarrollo y presentación local; no servicio obligatorio pagado ni cargos automáticos. | Restricción explícita |
| Fases | Usuario corrigió al asistente: después de UML no se crea ya la base, se sigue el paso a paso acordado; se continuó con MER. Arquitectura/UI/UX precede programación. | Instrucción explícita |

## Diferencias entre decisiones y recomendaciones

1. **Cancelación:** “customer” identifica quién solicita; “before/preparation” define el plazo. No es contradicción. La exigencia de aprobación del trabajador no está confirmada. La sugerencia inicial de permitir hasta antes de preparación con autorización se conserva como pendiente, no como hecho.
2. **Inventario “finished” vs. “before”:** la decisión “finished” fue resumida por el asistente como inventario de productos terminados (tipo de artículos), mientras que “before” era respuesta al momento de descuento en pedidos de mesa. El mensaje de usuario anterior dijo descontar cuando el trabajador acepta. Por ello no hay evidencia suficiente para sustituir aceptación por “al terminar”; el SRS documenta productos terminados y descuento al aceptar. Verificar si el contexto original deja alguna duda antes del esquema final.
3. **Actor de atención “both”:** el término se conserva como frase del usuario; los chats no aclaran exactamente si se refiere a ambas sedes. La documentación usa un solo actor Trabajador de atención según diagramas posteriores, sin inferir su asignación organizativa.
4. **Reportes:** en una etapa se aprobaron cinco reportes incluido productos más vendidos. Después, el usuario sugirió quitarlo y aprobó los demás tras revisión. La decisión posterior prevalece: quitarlo del MVP.
5. **Incidencias de reparto:** el reporte de incidencias y el historial personal aparecen en el diagrama general que el usuario aprobó. La alternativa recomendada era dejar la entrega en incidencia para que atención decida; no se vio elección A/B inequívoca, por lo que queda pendiente quién resuelve y si se permite reintento.
6. **Despliegue:** el pedido de migrar a Render + Neon aparece como texto no enviado en el cuadro de entrada del chat de stack. La última respuesta recomienda operar localmente y no depender de un plan gratis. Render/Neon no es decisión aprobada.
7. **UML/MER:** las 20 clases y 31 relaciones corresponden a una base previa a refinamientos. Añadir las clases aprobadas en fases posteriores y revisar cardinalidades; no fijar estos conteos como definitivos.

## Pendientes y decisiones aún abiertas

- Rol o roles concretos que pueden aprobar cancelaciones.
- Quién decide reintento, retorno u otra resolución de una entrega `NO_ENTREGADA`.
- Alcance organizativo de la expresión histórica “Atención: both”.
- Duración/expiración del token QR y mecanismo de notificaciones/actualización.
- Si un intento de `Pago` puede ser parcial o debe cubrir el saldo completo.
- Almacenamiento local privado, acceso, respaldo y eliminación de comprobantes.
- Existencias iniciales y permisos/motivos para ajustes y mermas.
- Catálogo completo y transiciones de estados de `Pedido` y `Pago`.
- Métricas, tareas, muestra y protocolo de evaluación académica.
- Decisiones físicas para Prisma: nulabilidad de atributos opcionales, referencia de origen de `MovimientoInventario`, unicidades pendientes, precisión monetaria y política de borrado.
- Confirmar en el repositorio las versiones y presencia real de Prisma/Prisma Client/adaptador PostgreSQL antes de instalar o actualizar dependencias.

No son pendientes: autenticación obligatoria del cliente (no se requiere para pedidos externos), aprobación del MER, conteo de entidades, tarifa de domicilio de 2.000 COP ni asignación automática de sede por disponibilidad completa y proximidad.

## Cómo actualizar

Cuando el usuario tome una nueva decisión, actualizar el archivo dueño (`SRS.md`, `UML.md`, `MER.md` o documento de arquitectura), cambiar el estado y añadir una fila de cambio aquí que indique la regla anterior, la nueva regla, la fecha y la referencia de conversación si existe. Mantener intacta la historia necesaria para explicar por qué se cambió.


### 2026-11-22 — Selección en el reverso de la tarjeta

**Decisión aprobada:** por instrucción posterior del usuario, se sustituye la vista previa superpuesta por un giro 3D en la propia tarjeta. El frente coloca el precio junto al título; el reverso concentra descripción, símbolo, cantidad y acción de agregar. Agregar o volver restaura el frente. Los patrones usan un reloj compartido para mantener su recorrido al cambiar de apartado.
