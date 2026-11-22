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
| Desarrollo | El usuario autorizó la primera aplicación Next.js y su portada visual. Continúan excluidos Prisma, PostgreSQL, migraciones y reglas de negocio en esta entrega. Sustituye la espera general de autorización para programar el frontend. | Aprobada |
| Catálogo | Panadería, Fritos y Bebidas. Para la implementación inicial, Fritos comprende empanadas y pasteles; las papas quedan aplazadas por petición posterior del usuario. Bebidas comprende avena y sevillana. Amplía el contenido visual más allá de panes, usando las categorías existentes. | Aprobada; papas futuras |
| Cabecera | SVG centrado, sin texto Amankay adicional, navegación inferior INICIO / PANADERÍA / FRITOS / BEBIDAS. Referencia de jerarquía: MASA. | Aprobada |
| Título | Todas las páginas públicas de esta entrega usan únicamente «Amankay» como título de pestaña; reemplaza «Panadería \| Amankay». No fija nombre comercial definitivo. | Aprobada |
| Paleta | Retirar verde y usar cacao, crema, trigo, durazno y cobre del logo, conservando marfil. Contrastes y usos en UI/UX. Sustituye verde hoja/terracota/mostaza como dirección estética. | Aprobada |
| Proceso | Video proporcionado, con avance y retroceso mediante scroll. Sustituye las cuatro fotografías seleccionables. | Aprobada |
| Accesibilidad del clip | Movimiento reducido inicia con controles manuales; se puede activar scroll expresamente o saltar el recorrido. Seeks secuenciales, sin capturar desplazamiento; el clip se mantiene independiente de Motion. | Elección técnica dentro de la implementación autorizada |
| Recursos | Originales conservados; fotografías WebP para web, MP4 en carpeta de videos. No reutilizar imágenes de MASA. | Elección técnica dentro de la implementación autorizada |
| Datos comerciales | Fotos de Fritos/Bebidas, precios, recetas y disponibilidad siguen por confirmar. No inferirlos de la referencia. | Pendiente |

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

## Matriz de conciliación del texto de revisión más reciente

El usuario aportó un segundo resumen de ChatGPT sobre el proyecto. Se usa como indicio de decisiones que pueden haberse acordado en conversaciones no incluidas entre los once enlaces. Como el texto no incluye enlaces ni fechas de esos acuerdos, se registra su procedencia y se contrasta con el historial disponible; no se presenta como corroborado por los once chats.

| Tema | Estado según el texto nuevo | Cotejo con los once chats y documentación | Acción documental |
| --- | --- | --- | --- |
| Cancelación | Definida: cliente solicita antes de preparación; personal encargado aprueba. | Los once chats respaldan la ventana antes de preparación. La aprobación por personal aparece en el flujo UML general, pero la autorización específica se había marcado ambigua. El resumen nuevo la reporta como acuerdo. | Actualizar SRS como decisión reportada por el usuario; anotar la procedencia y mantenerla verificable contra el chat original si luego se aporta. |
| Incidencias de entrega | Definidas: estados y observaciones simples; sin entidad nueva. | Los chats respaldan registrar incidencias, pero no permiten confirmar esa decisión de modelado simple. | Adoptar la regla funcional reportada; no crear clase Incidencia en la propuesta de MVP. Revisar representación en UML/MER. |
| Sucursal para domicilio | Automática según disponibilidad del pedido completo y proximidad; no dividir pedidos. | El historial original deja asignación por inventario/proximidad como propuesta, no decisión explícita. El texto nuevo la reporta como ya decidida. | Incorporar como decisión reportada y regla a reflejar; documentar “pedido completo, sin división”. |
| Tarifa domicilio | 4.000 COP, configurable desde administración. | No aparece en los once chats revisados. | Incorporar como decisión reportada; falta precisar unidad, alcance (por pedido/zona) y si aplica a todas las sedes. |
| Cobertura | Inicialmente Neiva. | No aparece en los once chats revisados. | Incorporar como alcance geográfico inicial reportado. |
| Nombre del negocio | Confirmar El Alambique. | El anteproyecto lo menciona; chats usan Amankay como nombre del sistema. | Pendiente de confirmación del usuario. |
| Conteo de entidades | Los inventarios históricos de 22 y 27 eran de etapas distintas. | Modelo vigente: 24 entidades de dominio + 2 asociativas = 26. No hay entidad independiente de cierre. | Conteo actual consolidado para revisión del MER. |
| UML, MER, arquitectura y UI/UX | Mantener revisión y orden de fases; sin base de datos todavía. | Coincide con la indicación explícita del usuario y con el historial. | Conservar la puerta de aprobación antes de desarrollo. |
| Criterios de aceptación | Deben definirse para pedidos, inventario, reposiciones, pagos, mesa/QR y usabilidad. | No estaban cerrados en las once conversaciones; coincide con el vacío del SRS. | Crear sección de criterios de aceptación pendiente, sin inventar umbrales. |

El resumen más reciente se toma como nueva información aportada por el usuario, pero no como evidencia de que todas esas frases aparezcan literalmente en los once enlaces. La aclaración posterior del usuario sobre reposiciones sí fija directamente la decisión definitiva para el proyecto. Si se comparte el chat de origen, completar la referencia histórica.

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

## Contradicciones, vacíos y pendientes

- Nombre del negocio vs. nombre del sistema: anteproyecto dice El Alambique; chats llaman Amankay.
- Cliente sin autenticación: una nota del diagrama general dice que no necesita iniciar sesión; confirmar si se mantiene como comportamiento aprobado para el SRS.
- Cancelación antes de preparación confirmada, pero aprobación automática vs. manual sin decisión inequívoca.
- Significado organizacional de “Atención: both”.
- Asignación de sede para domicilio y algoritmo de distancia/cobertura.
- Tarifas, cobertura, ubicación/dirección, y política de sede para pedidos a domicilio.
- Qué significa exactamente “incidencia” para estado de Entrega y quién puede reabrir/reintentar.
- Duración de sesión, notificación en tiempo real, procesos de carga inicial de inventario, niveles de autorización para ajustes/mermas/cierre de faltantes.
- Métricas y criterios de evaluación del anteproyecto.
- El UML final debe absorber recepción repetida/parcial y las nuevas clases; no usar la primera regla “máximo una recepción”.
- Stack actual de SpacesApps_2 fue leído desde archivos compartidos en el chat; la carpeta Amankay no contiene aún esos archivos. Versiones requieren verificación cuando se inicie desarrollo.

## Cómo actualizar

Cuando el usuario tome una nueva decisión, actualizar el archivo dueño (`SRS.md`, `UML.md`, `MER.md` o documento de arquitectura), cambiar el estado y añadir una fila de cambio aquí que indique la regla anterior, la nueva regla, la fecha y la referencia de conversación si existe. Mantener intacta la historia necesaria para explicar por qué se cambió.
