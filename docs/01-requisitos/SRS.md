# Especificación de requisitos de software

## 1. Propósito

Amankay centraliza la consulta del negocio, su catálogo, la recepción de pedidos y la operación de varias sucursales. Debe servir a clientes y al personal que atiende pedidos, administra mesas, controla inventario, coordina reposiciones y realiza entregas.

El anteproyecto describe una panadería con una sede principal y una segunda sede, pedidos por QR y coordinación del surtido de productos elaborados desde la sede principal. Allí aparece el nombre histórico El Alambique; el usuario confirmó posteriormente que el nombre del negocio para este proyecto es Amankay. Se conservan los requisitos operativos del anteproyecto sin adoptar su nombre anterior.

## 2. Fuentes y criterio de autoridad

Se consultaron en el navegador las once conversaciones compartidas de la sección “Fuentes” en `docs/03-arquitectura/decisiones-tecnicas.md`. Se pudieron abrir y leer sus mensajes relevantes; varios chats presentan respuestas anteriores colapsadas visualmente, que se expandieron con el control de copia del propio mensaje. Este SRS consolida requisitos y decisiones, no reproduce palabra por palabra cada turno. Las expresiones del usuario tienen precedencia sobre recomendaciones del asistente; cuando el usuario acepta una recomendación, se registra como aprobada.

La secuencia de decisiones importa: en caso de cambio explícito, usar la instrucción posterior. Un mensaje como “sí” solo confirma la propuesta inmediatamente anterior disponible en ese chat; no autoriza asumir opciones que no se ven.

## 3. Actores y perfiles

Los cinco actores consolidados en el diagrama general son:

1. **Cliente:** explora catálogo y sucursales, realiza pedidos y consulta el seguimiento. El diagrama general aprobado indica que no necesita iniciar sesión.
2. **Trabajador de atención:** gestiona pedidos externos y de mesa, pagos operativos, cancelaciones y asignación manual de repartidores.
3. **Encargado de inventario:** consulta/ajusta inventario y participa en reposiciones. Es un actor lógico único; sus operaciones cambian según la sucursal: la secundaria solicita y recibe; la principal revisa, aprueba, prepara y despacha.
4. **Administrador:** administra usuarios, roles y configuración del negocio. Los permisos operativos no se heredan por ser administrador; se asignan explícitamente si también debe atender operaciones.
5. **Repartidor:** consulta y actualiza únicamente entregas que le fueron asignadas.

Las decisiones “Encargados: one” y “Atención: both” se conservan como expresiones originales del chat. Su significado exacto (un actor encargado generalizado y el alcance de “both” para atención) no quedó explicado semánticamente; los casos de uso posteriores adoptan los cinco actores listados arriba. No crear actores separados para sucursal principal/secundaria sin nueva decisión.

El modelo de clases registra repartidores como `Usuario` con un rol, no como una clase de identidad aparte. El usuario de entrega tiene acceso limitado a las asignaciones propias.

`Usuario`–`Rol` y `Usuario`–`Sucursal` son relaciones M:N. El modelo relacional utiliza `UsuarioRol` y `UsuarioSucursal`, cada una con PK compuesta por ambas FK. La política de permisos individuales no queda definida; el alcance documentado es permisos por rol y acceso por sucursal.

## 4. Alcance funcional y prioridades

### 4.1 Esencial para el MVP

- Consultar catálogo, productos, categorías, sucursales, horarios y contactos/datos del negocio.
- Crear pedidos externos para recoger o recibir a domicilio; consultar disponibilidad.
- Acceder a pedidos de mesa mediante QR con sesión temporal activada por el personal.
- Acumular varios pedidos aceptados de una misma sesión de mesa en una cuenta común, aun si otro pedido sigue en preparación; cada pedido conserva su flujo de revisión y preparación.
- Mostrar estados e historial de pedidos; permitir seguimiento por código seguro.
- Gestionar la cola de pedidos sin bloquear la atención de los siguientes.
- Registrar pedidos recibidos directamente por WhatsApp de forma manual desde el panel de pedidos externos.
- Gestionar pagos por efectivo y transferencia con verificación manual, comprobantes, rechazos y reembolsos manuales totales (sin reembolsos parciales).
- Controlar inventario de productos terminados por sucursal, con movimientos e historial.
- Crear/revisar solicitudes de reposición entre sucursales y registrar despacho y recepción, incluso parcial y con diferencias.
- Asignar repartidores manualmente y permitir que consulten/actualicen sus propias entregas e incidencias.
- Administrar productos, categorías, precios, sucursales, horarios, usuarios, roles, mesas/QR, cobertura y tarifa de domicilio.
- Consultar reportes administrativos aprobados: ventas por sucursal y periodo; historial y estados de pedidos; inventario y movimientos por sucursal; historial de reposiciones.
- Mantener auditoría genérica de acciones administrativas importantes; los eventos operativos conservan su historial en sus propios registros.

### 4.2 Simplificable

- UI 3D, transiciones complejas y efectos promocionales: permitidos solo donde aporten, simplificables; paneles operativos priorizan rapidez y claridad.
- React Hook Form, TanStack Table, Recharts y Sonner: incorporar solo si resuelven una necesidad real.
- Diagramas específicos por proceso además del diagrama general: producir los necesarios para aclarar flujos complejos, sin duplicar funcionalidades.
- El historial personal del repartidor aparece en el diagrama general aprobado y puede resolverse de forma sencilla.

### 4.3 Futuro o fuera del MVP

- Automatización de conversaciones de WhatsApp mediante WhatsApp Business Platform, webhooks o proveedor: futura; WhatsApp directo se opera manualmente en el MVP.
- Personalizaciones o modificaciones de productos: explícitamente no para el MVP.
- Automatización de asignación de repartidores: no; asignación manual.
- Publicación web permanente en hosting de terceros: no es requisito ni se garantiza gratis para siempre; valorar solo en una fase posterior.
- Servicios y herramientas de pago, suscripciones o costos obligatorios: excluidos.
- Redis, Docker, microservicios, servidor Express independiente y Rive quedan fuera del MVP. El usuario autorizó el 21-11-2026 instalar GSAP, PixiJS, Three.js, React Three Fiber y Drei para la experiencia visual pública; su uso se limita a escenas puntuales y no forma parte del funcionamiento transaccional.
- “Productos más vendidos” en reportes: el usuario sugirió quitarlo por no ser necesario inicialmente y luego aprobó el resto tras una revisión completa. Excluirlo del MVP.

## 5. Requisitos funcionales

### RF-01 Catálogo e información pública

El cliente puede consultar productos y sus precios, categorías, sucursales, horarios y datos informativos del negocio.

Para la implementación pública, la sede principal tiene dirección confirmada en Calle 4 # 5-55, Centro de Neiva; lunes a viernes de 6:30 a. m. a 6:30 p. m.; sábados de 6:30 a. m. a 1:00 p. m.; cerrada domingos y festivos; teléfono 312 586 4045. La sede secundaria queda habilitada como opción de recogida en Carrera 7 # 19-20, Neiva, con el mismo horario y teléfono de contacto. Las tarjetas no muestran etiquetas de numeración. El modelo de horario aún debe resolver cómo registrar cierres por festivos.

Las categorías iniciales confirmadas por el usuario son **Panadería**, **Fritos** (empanadas y pasteles) y **Bebidas** (avena, sevillana y guarapo). Las papas quedan fuera de la implementación inicial, aunque podrán reconsiderarse después. Son categorías del catálogo existente; no crean entidades ni reglas de pedidos adicionales. Las recetas y la disponibilidad se completan con datos confirmados.

El 22-11-2026 el usuario fijó los precios para el catálogo inicial: todos los panes a **2.000 COP**, todos los fritos a **3.500 COP**, Avena y Sevillana a **3.500 COP**, y Guarapo a **3.000 COP**. Las recetas y existencias siguen pendientes.

### RF-02 Pedido para recoger

El cliente selecciona la sucursal de recogida. El sistema valida el carrito completo contra el inventario de esa sede. Si no alcanza para todos los ítems, informa cuáles faltan y recomienda una sucursal capaz de completar el carrito entero. No recomendar con base únicamente en el primer producto faltante.

### RF-03 Pedido a domicilio

El cliente proporciona dirección y referencias necesarias. La sucursal de preparación se asigna automáticamente entre las sedes que puedan completar el pedido, considerando la disponibilidad del pedido completo y la proximidad; no se divide un pedido entre sedes. La cobertura inicial de domicilio es Neiva y la tarifa adicional configurable para el prototipo es de 2.000 COP por solicitud de domicilio, según instrucción directa del usuario del 22-11-2026. Este importe reemplaza los 4.000 COP anteriores. Si ninguna sede puede completar el pedido, no se acepta ni se divide: se informa que no hay disponibilidad.

### RF-04 Pedido de mesa

El QR permanente identifica mesa y sucursal. No autoriza por sí mismo a pedir. Personal habilitado abre la sesión y el sistema genera un token temporal seguro. Al cerrar la sesión, se invalida el token. Solo una sesión activa y una cuenta abierta por mesa. No se permite abrir otra sesión mientras exista una cuenta abierta. Cada pedido se acepta/rechaza por separado; los pedidos aceptados se agregan a la misma cuenta. Cada sesión tiene exactamente una cuenta y cada cuenta corresponde a una sesión; se crean juntas en una operación atómica, pero se cierran independientemente. La cuenta puede permanecer abierta después de cerrar la sesión para completar el cobro.

Una cuenta puede contener varios pedidos; cada pedido QR pertenece a una cuenta y los pedidos externos no se vinculan a ninguna. Por ello, `Pedido.cuentaMesaId` es obligatorio para pedidos QR y nulo para pedidos externos.

### RF-05 Pedido iniciado por WhatsApp

El cliente escribe al canal de contacto del negocio. El personal recopila productos, cantidades, modalidad y datos necesarios, y registra manualmente el pedido en el panel de pedidos externos. Luego se tramita con el flujo común de pedido externo. WhatsApp no es actor del sistema ni existe integración automática aprobada.

### RF-06 Confirmación y expiración

Los pedidos web que esperan que el cliente complete la confirmación por WhatsApp tienen vigencia de 30 minutos y luego expiran. No apartan unidades mientras están pendientes. La disponibilidad se vuelve a comprobar al aceptar.

### RF-07 Aceptación y cola

El personal acepta o rechaza y registra un motivo en caso de rechazo. Mostrar los pedidos por llegada; avisar visual y sonoramente. Tres minutos es el tiempo recomendado para responder, no una regla confirmada de expiración. Al superar ese lapso, el pedido pasa a atención prioritaria y el trabajador puede tomar el siguiente. No rechazar automáticamente pedidos demorados ni bloquear la cola.

### RF-08 Inventario de pedidos

Se controlan productos terminados, no materias primas, según la decisión “Inventario: finished” que el asistente interpretó como inventario de productos terminados. La existencia se descuenta cuando el trabajador acepta el pedido, como afirmó el usuario en una decisión previa y como se repitió en el diagrama consolidado. La operación es atómica para que dos aceptaciones no consuman las mismas unidades. Si se cancela un pedido cuyas unidades no se consumieron, el flujo debe restaurarlas.

### RF-09 Seguimiento

Mostrar un código difícil de adivinar, estado actual e historial, sucursal, productos/cantidades, total y estado del pago. Ocultar dirección completa, teléfono y datos personales del destinatario.

### RF-10 Cancelaciones

El cliente puede solicitar cancelar antes de que comience la preparación. La solicitud requiere aprobación de personal autorizado; no es una cancelación automática. La asignación de este permiso a un rol concreto (atención, encargado u otro rol existente) permanece pendiente y se registra en la matriz de decisiones. No ofrecer solicitud por el flujo de cliente después de iniciada la preparación.

Si se autoriza, restaurar inventario solo si había sido descontado y las unidades son recuperables; registrar reembolso manual solo si el pedido ya se pagó.

### RF-11 Pagos y reembolsos

- Medios documentados: efectivo y transferencia; sin pasarela automática acordada.
- La transferencia se verifica manualmente antes de preparación.
- Permitir intentos múltiples; pagos rechazados no cuentan como dinero recibido. Cada intento es un registro `Pago` y admite como máximo un comprobante; un nuevo intento crea otro `Pago`.
- No confirmar pagos por encima del saldo pendiente.
- Cada `Pago` tiene un origen exclusivo: pedido externo o cuenta de mesa.
- Si corresponde, permitir un reembolso manual total de un pago confirmado; no existen reembolsos parciales. La fecha, motivo, estado y responsable se registran en el mismo `Pago`.
- Si el pago se rechaza definitivamente, borrar el archivo del comprobante; conservar estado, fecha, motivo y registro del intento. El usuario consideró innecesario conservar el archivo rechazado, no la trazabilidad.
- El registro del pago en efectivo del cliente es distinto de la entrega de recaudo del repartidor. Para esta última se conserva el flujo simple aprobado: registrar monto declarado por repartidor y monto recibido por sucursal, y exigir motivo si difieren. No incluye conciliación bancaria, arqueos ni liquidaciones parciales avanzadas.

### RF-12 Repartos

La asignación es manual por el trabajador de atención. Un pedido a domicilio puede tener cero o una entrega; cada entrega pertenece exactamente a un pedido. El repartidor solo ve sus entregas asignadas y los datos necesarios: información del pedido, productos, cantidades, observaciones, nombre/dirección/teléfono y referencias requeridas para entregar. Registra recogida, entrega o incidencia; no puede asignarse pedidos a sí mismo. La transición a entregado no puede saltarse la recogida. Pedido y entrega mantienen estados separados.

Las incidencias se registran de forma simple en la propia `Entrega`, mediante su estado y observaciones; no se crea una entidad independiente `Incidencia` en el MVP. La decisión sobre quién autoriza un reintento, retorno u otra resolución después de una entrega no realizada permanece pendiente. Los estados de entrega aprobados son `PENDIENTE_ASIGNACION`, `ASIGNADA`, `RECOGIDA`, `EN_CAMINO`, `ENTREGADA` y `NO_ENTREGADA`.

Si una entrega falla, la incidencia se registra en la propia `Entrega` mediante su estado y observaciones. La gestión formal de devoluciones, las inspecciones y la reincorporación de productos quedan fuera del MVP. Los productos que regresen físicamente no se reincorporan automáticamente al inventario disponible. Esta decisión del 22-11-2026 sustituye la regla anterior de inspección obligatoria.

### RF-13 Reposiciones

- Las secundarias solicitan y reciben; la principal revisa, aprueba/rechaza, prepara y despacha.
- Una solicitud admite múltiples despachos y recepciones parciales. Cada recepción se vincula a un despacho concreto. Cantidades solicitadas/aprobadas se conservan en el detalle de solicitud; cantidades enviadas/recibidas se guardan en registros de despacho/recepción. Los pendientes se calculan desde esos registros, por detalle y despacho; no pueden ser negativos. Lo dañado cuenta como recibido físicamente, pero no ingresa al stock disponible. Se admite un cierre final por detalle: antes del despacho en `DetalleSolicitudReposicion`, después del despacho en `DetalleDespachoReposicion`. Cada cierre registra cantidad, motivo, fecha/hora y usuario responsable. Un detalle admite como máximo una reversa total; sus campos guardan fecha/hora, usuario y motivo de reversa sin borrar/sobrescribir el cierre. No se permiten reversas parciales ni un segundo ciclo. Una reversa deja de descontar el cierre del saldo pendiente correspondiente. Los cierres previo y posterior afectan exclusivamente el pendiente de despacho y el pendiente de recepción, respectivamente. Los eventos originales se conservan; despacho o recepción se corrigen anulando el evento completo cuando sea seguro y registrando uno nuevo. La anulación no modifica inventario automáticamente; movimientos compensatorios son nuevos registros independientes y los pendientes no afectan existencias disponibles. Si el producto ya fue consumido, se deriva a revisión administrativa sin stock negativo ni modificación de ventas.

Se descarta la simplificación de una sola recepción y sin despachos parciales: contradice la opción A aprobada y reafirmada por el usuario el 21-11-2026.

### RF-14 Administración y reportes

El administrador configura usuarios, roles/permisos, sucursales, productos, categorías, precios, horarios, mesas/QR y parámetros de domicilio. No obtiene automáticamente permisos de operación. Reportes iniciales: ventas por sede y periodo, historial/estados de pedidos, inventario/movimientos por sede y reposiciones. Se elimina “productos más vendidos” del primer alcance.

### RF-15 Auditoría

Registrar con `RegistroAuditoria` solo acciones administrativas importantes, incluyendo actor, fecha/hora, operación, entidad e identificador, valores anterior/nuevo cuando aplique y descripción. `tipoActor` distingue `USUARIO` y `SISTEMA`; para sistema el usuario puede ser nulo. Los eventos operativos de Pago, inventario, despachos, recepciones, cierres de faltantes y conciliación simple de efectivo permanecen en sus registros propios y no se duplican aquí.

## 6. Reglas de negocio consolidadas

- Una sesión QR se inicia manualmente; un QR fijo no basta para autorizar pedidos.
- Pedidos de mesa se aceptan individualmente, pero comparten una cuenta por sesión.
- Inventario de productos terminados por sucursal; no se inventaría materia prima en esta versión.
- Deducción de stock al aceptar el pedido y restauración condicional tras cancelación.
- No reserva de stock durante confirmación de 30 minutos.
- Recomendación de sucursal de recogida considera el carrito completo.
- Entrega, pedido y pago son ciclos de estado separados.
- La principal atiende el ciclo de aprobación y despacho de reposición; secundaria solicita y recibe.
- La gestión formal de devoluciones de entregas fallidas está aplazada fuera del MVP; un producto que regrese físicamente no se reincorpora automáticamente al inventario disponible.
- El reembolso es manual, solo total y registrado dentro del `Pago`; Amankay registra el proceso, no mueve fondos.
- Trazabilidad del intento de pago se conserva aun cuando se elimina el archivo rechazado.
- Toda confirmación concurrente que afecte inventario o saldo requiere protección transaccional.

## 7. Requisitos no funcionales

- Interfaz en español y adaptable a teléfonos, ya que el QR se usará desde dispositivos móviles.
- Los datos del seguimiento de pedido se limitan a lo necesario; no exponer los datos personales del destinatario.
- Permisos por rol y sucursal; el repartidor solo accede a sus asignaciones.
- Operaciones de aceptación, inventario, pago y reembolso deben mantener consistencia ante concurrencia.
- Desarrollo y exposición universitaria ejecutables localmente sin pagos obligatorios.
- Paneles de operación claros y rápidos; reservar animaciones, 3D y transiciones para páginas públicas o promocionales.

## 8. Evaluación planteada

El anteproyecto propone pruebas de acceso QR, consulta de información/productos y creación de pedidos; revisión del flujo de abastecimiento entre sedes; y opinión de clientes y personal sobre facilidad de uso. Métricas, método de muestreo y criterios de aceptación aún no están definidos.

## 9. Decisiones pendientes y precisiones por módulo

Las siguientes cuestiones no reabren el MER aprobado. Se resolverán antes de implementar el módulo al que afectan; las que condicionan la estructura física de la base de datos se deben cerrar antes de generar la migración inicial.

1. **Permiso de cancelación:** está aprobado que el cliente solicite antes de preparación y que personal autorizado apruebe o rechace. Falta asignar el permiso a uno o varios roles existentes.
2. **Incidencias de entrega:** el registro mediante estado y observaciones en `Entrega` está definido. Falta decidir quién autoriza reintento, retorno u otra resolución.
3. **Atención: both:** falta aclarar el alcance organizativo exacto de esa expresión histórica; no crear actores o roles nuevos a partir de ella.
4. **Sesión QR:** falta fijar duración/expiración del token temporal y mecanismo de actualización/notificación. El cierre manual de sesión invalida el token.
5. **Pagos parciales:** está aprobado permitir varios intentos y no sobrepasar el saldo pendiente. Falta decidir si un intento puede cubrir solo una parte del saldo. Los reembolsos parciales están descartados: el reembolso es manual y total.
6. **Comprobantes:** el archivo de un intento rechazado definitivamente se elimina y se conservan sus metadatos. Falta definir almacenamiento local privado, política de respaldo y acceso antes de implementar carga/consulta.
7. **Inventario inicial y ajustes:** falta definir existencias iniciales, quién puede hacer ajustes/mermas y los motivos exigidos. Se mantienen las reglas aprobadas de no stock negativo y trazabilidad de movimientos.
8. **Estados y transiciones:** falta consolidar el catálogo completo de estados y transiciones de `Pedido` y `Pago`. Los estados de `Entrega` y `SolicitudReposicion` se documentan en sus respectivos apartados/modelo; no inventar estados adicionales.
9. **Evaluación:** faltan criterios cuantificables, tareas, muestra, escala y método académico de evaluación de aceptación/usabilidad.
10. **Detalles técnicos del esquema:** nulabilidad de atributos marcados como opcionales/provisionales y origen trazable de `MovimientoInventario` deben cerrarse en la conciliación técnica antes de la migración inicial.

## 10. Trazabilidad histórica

Enlaces de las once conversaciones consultadas:

1. [Requisitos iniciales y decisiones finales del MVP](https://chatgpt.com/share/6b01d0a2-035c-83ea-aee5-39db38d3b578)
2. [Actores y casos de uso](https://chatgpt.com/share/6b01d0bf-a34c-83ea-a330-a71f677250f8)
3. [Consolidación del diagrama general y reposiciones por sucursal](https://chatgpt.com/share/6b01d0b0-86d8-83e8-859a-dd93e89cd206)
4. [Recepciones parciales y módulo de repartos](https://chatgpt.com/share/6b01d0d0-fd70-83e9-b681-8e1f6b1baf3b)
5. [Devoluciones fallidas e inspección de productos](https://chatgpt.com/share/6b01d0da-89f0-83e9-948c-4dd392481859)
6. [Pagos, comprobantes, reembolsos y conciliación](https://chatgpt.com/share/6b01d0e3-468c-83e9-82b3-22dcec98c569)
7. [Clases UML y correcciones técnicas](https://chatgpt.com/share/6b01d0f1-4d10-83e9-a5e7-6e075dedce85)
8. [Relaciones y cardinalidades MER](https://chatgpt.com/share/6b01d103-6fe8-83e9-953e-5403db925930)
9. [Secuencia de fases y alcance MER](https://chatgpt.com/share/6b01d114-7e04-83e9-bb40-c135412f6824)
10. [Stack y análisis de dependencias](https://chatgpt.com/share/6b01d123-58a4-83e9-ba45-329495ddbd6d)
11. [Arquitectura y despliegue sin gasto obligatorio](https://chatgpt.com/share/6b01d131-5274-83e9-938e-5488f72f99f5)
