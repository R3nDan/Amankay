# Modelo entidad-relación

## Estado

El usuario confirmó el 22-11-2026 que el análisis y diseño concluyeron y aprobó el MER lógico consolidado de este documento. El 22-11-2026 también aprobó las precisiones funcionales para pedidos web, pagos, permisos, QR y compensaciones. Se autoriza implementar manteniendo 24 entidades de dominio y 2 asociativas.

El inventario descrito aquí es el modelo lógico aprobado. La cuenta histórica de 31 relaciones precede a refinamientos posteriores y no se usa como conteo actual.

## Grupos de entidades

1. Usuarios y organización: `Usuario`, `Rol`, `Sucursal`.
2. Catálogo e inventario: `Categoria`, `Producto`, `InventarioSucursal`, `MovimientoInventario`.
3. Pedidos: `Pedido`, `DetallePedido`.
4. Mesas: `Mesa`, `SesionMesa`, `CuentaMesa`.
5. Pagos: `Pago` incluye como máximo un comprobante por intento y los datos del reembolso total manual. `ComprobantePago`, `Reembolso` y `MovimientoBancario` no son entidades separadas. Se conserva `ConciliacionEfectivo`, una por entrega.
6. Entregas: `Entrega` vinculada a pedido a domicilio; repartidor es `Usuario` con rol.
7. Reposición: `SolicitudReposicion`, `DetalleSolicitudReposicion`, `DespachoReposicion`, `DetalleDespachoReposicion`, `RecepcionReposicion`, `DetalleRecepcionReposicion`.
8. Administración y trazabilidad: `HorarioSucursal`, `ConfiguracionDomicilio`, `RegistroAuditoria`.

La lista resume los grupos del MER lógico aprobado. No se incorpora `CierreFaltanteReposicion` al MVP; el cierre final se registra en la línea de solicitud o despacho correspondiente. Las correcciones de despachos y recepciones se realizan anulando el evento completo cuando sea seguro y registrando uno nuevo.

## Inventario técnico entidad por entidad

El inventario histórico de 27 candidatas corresponde a una etapa anterior y no representa el modelo vigente. El modelo lógico aprobado contiene 24 entidades de dominio y 2 asociativas, total 26. La implementación física corresponde a PostgreSQL con JPA/Hibernate y Flyway; sus tipos, nulabilidad, índices y checks quedan detallados en [modelo físico PostgreSQL](modelo-fisico-postgresql.md).

| Entidad | Propósito y atributos documentados (tipo conceptual; `?` = opcional/provisional) | PK y FKs candidatas | Relaciones / cardinalidad candidata | Prioridad y estado |
| --- | --- | --- | --- | --- |
| `Usuario` | Identidad interna: `id UUID`, `nombre String`, `apellido String`, `correo String`, `telefono String`, `passwordHash String`, `activo Boolean`, `fechaCreacion DateTime`, `ultimoAcceso DateTime?`. | PK `id`; asociaciones por `UsuarioRol.usuarioId` y `UsuarioSucursal.usuarioId`. | M:N con `Rol` y `Sucursal` mediante asociaciones con PK compuestas. 1:N con sesiones, pedidos operativos, auditoría, reposiciones, recepciones y entregas como repartidor. | Esencial; relaciones M:N fijadas en la instrucción actual. |
| `Rol` | Nombre y descripción de cada rol: `id UUID`, `nombre String`, `descripcion String?`. | PK `id`; asociación `UsuarioRol.rolId`. | M:N con `Usuario` mediante `UsuarioRol`. Roles iniciales: ADMINISTRADOR, ATENCION, INVENTARIO y REPARTIDOR; Java aplica permisos y sucursal. Administrador no hereda permisos operativos. | Esencial; matriz operativa aprobada el 22-11-2026. |
| `Sucursal` | Sede del negocio: `id UUID`, `nombre String`, `direccion String`, `telefono String?`, `tipo TipoSucursal`, `activa Boolean`, `fechaCreacion DateTime`, `latitud Decimal?`, `longitud Decimal?`. | PK `id`; asociación `UsuarioSucursal.sucursalId`. | M:N con `Usuario`; 1:N a inventarios, mesas, horarios, movimientos y solicitudes. Coordenadas opcionales para elegir por proximidad cuando el cliente comparte GPS. | Esencial; coordenadas justificadas por el flujo aprobado de domicilios. |
| `Categoria` | Clasifica productos: `id UUID`, `nombre String`, `descripcion String?`, `activa Boolean`. | PK `id`. | 1:N `Producto`; nombre globalmente único sin distinguir mayúsculas. | Esencial; unicidad física definida en modelo PostgreSQL. |
| `Producto` | Catálogo global: `id UUID`, `nombre String`, `descripcion String?`, `imagen String?`, `precio Decimal`, `activo Boolean`, `fechaCreacion DateTime`, `fechaActualizacion DateTime`. | PK `id`; FK `categoriaId`. | M:1 `Categoria`; 1:N a inventarios, detalles de pedido y detalle de solicitud. Nombre globalmente único sin distinguir mayúsculas; no se modelan variantes. | Esencial; unicidad física definida en modelo PostgreSQL. |
| `InventarioSucursal` | Saldo disponible de producto terminado por sede: `id UUID`, `stockDisponible Integer`, `fechaActualizacion DateTime`. | PK `id`; FKs `sucursalId`, `productoId`. | M:1 a cada una; única pareja `(sucursalId, productoId)`. | Esencial; UML base. |
| `MovimientoInventario` | Historial append-only: `id UUID`, `tipo TipoMovimiento`, `cantidad Integer`, `stockAnterior Integer`, `stockResultante Integer`, `fechaHora DateTime`, `motivo String`, `tipoOrigen String`, `idOrigen UUID`, `movimientoCompensadoId UUID?`. | FK requerida a `InventarioSucursal`; `usuarioId?`; FK opcional autorreferenciada a `MovimientoInventario.id`, única. | `tipoOrigen` + `idOrigen` identifica la operación y Java valida su existencia/correspondencia. Máximo una compensación total por movimiento original, sin cadenas; la fila original no se modifica ni elimina. Un trigger impide UPDATE/DELETE. | Origen y compensación aprobados el 22-11-2026. |
| `Pedido` | Pedido externo o QR: `id UUID`, `codigoSeguimiento String`, `tipo TipoPedido`, `canalOrigen CanalOrigen`, `modalidadEntrega ModalidadEntrega?`, `estado EstadoPedido`, `fechaCreacion DateTime`, `fechaVencimiento DateTime?` (externo, 30 minutos), `total Decimal`, `costoDomicilioHistorico Decimal?`, `ubicacionConsentida Boolean`, `latitudEntrega Decimal?`, `longitudEntrega Decimal?`, datos de contacto/entrega opcionales según modalidad. | `sucursalId?` mientras un domicilio sin GPS espera asignación; Java exige sucursal para aceptar. `cuentaMesaId?` según tipo. Coordenadas solo se persisten con consentimiento y deben estar ambas presentes o ambas nulas. | 1:N `DetallePedido`; QR requiere cuenta; externo no la tiene. Recogida lleva sucursal seleccionada; domicilio con GPS elige sede disponible más cercana y conserva ubicación consentida para el repartidor; sin GPS exige dirección/barrio y queda para asignación manual. Domicilio: 0..1 `Entrega`. Pedido web se guarda antes de abrir WhatsApp y no reserva stock mientras espera confirmación manual. | Reglas aprobadas el 22-11-2026; persistencia de GPS necesaria para ejecutar la entrega. |
| `DetallePedido` | Línea e importe histórico: `id UUID`, `cantidad Integer`, `precioUnitarioHistorico Decimal`, `nombreProductoHistorico String`. | PK `id`; FKs `pedidoId`, `productoId`. | M:1 pedido y producto; no existe `DetalleCuenta`; la cuenta se deriva de pedidos aceptados. | Esencial; UML base. |
| `Mesa` | Mesa identificada por sucursal: `id UUID`, `identificador String`, `identificadorQR String`, `activa Boolean`. | PK `id`; FK `sucursalId`. | M:1 sucursal; 1:N sesiones históricas. `identificador` e `identificadorQR` únicos por sede. | Esencial; unicidad física definida en modelo PostgreSQL. |
| `SesionMesa` | Ventana segura QR: `id UUID`, `tokenSeguro String` (hash), `fechaApertura DateTime`, `fechaCierre DateTime?`, `estado EstadoSesion`, `abiertaPor UUID`, `cerradaPor UUID?`. | FK a mesa y usuarios responsables. | M:1 mesa; 1:1 obligatoria con cuenta. Expira a las 8 horas por configuración; el cierre manual invalida inmediatamente y la expiración no cierra la cuenta. No se abre una sesión nueva mientras la cuenta anterior siga abierta. | Aprobado el 22-11-2026. |
| `CuentaMesa` | Estado y ciclo de cobro de la sesión: `id UUID`, `fechaApertura DateTime`, `fechaCierre DateTime?`, `estado EstadoCuenta`. | PK `id`; FK `sesionMesaId NOT NULL UNIQUE -> SesionMesa`. | 1:1 obligatoria con `SesionMesa`; varios pedidos asociados directamente a la cuenta. Puede permanecer abierta tras cerrar sesión para completar el cobro. | Esencial; 1:1 y cierre independiente aprobados. |
| `Pago` | Cada fila es un intento: `id UUID`, `metodo MetodoPago`, `estado EstadoPago`, `importe Decimal`, fechas de creación/confirmación, datos de comprobante, verificación y reembolso manual total. | FK nullable `pedidoId` XOR `cuentaMesaId`; exactamente uno. | Varios intentos; cada intento aprobado cubre el saldo pendiente completo, sin parcialidad ni sobrepago. Reembolso manual exclusivamente total. | Decisión aprobada el 22-11-2026; no hay entidades separadas. |
| `ComprobantePago` | No es entidad separada; archivo y metadatos opcionales se guardan dentro de `Pago`. | Sin PK/FK propia. | Como máximo un comprobante por intento. Cada reintento genera otro `Pago`. | Fusionado en `Pago`; decisión aprobada. |
| `MovimientoBancario` | Elemento del inventario previo para verificación manual, sin atributos fuente ni integración bancaria. | No se propone PK/FK en el MVP. | Resultado y datos mínimos de verificación se registran en `Pago`. | Se propone retirar por redundancia; reevaluar solo si aparece conciliación bancaria real. |
| `Reembolso` | Fusionado en `Pago`; sin entidad separada. Si procede, se registra un reembolso manual total con fecha, motivo, actor y estado. | Sin PK/FK propia; datos dentro de `Pago`. | No hay reembolso parcial ni relación 1:N. | Fusionado en `Pago`; decisión funcional vigente. |
| `ConciliacionEfectivo` | Registro simple de entrega de recaudo: `id UUID`, `montoDeclarado Decimal`, `montoRecibido Decimal`, `fechaConciliacion DateTime`, `motivoDiferencia String?`. | PK `id`; FK `entregaId NOT NULL UNIQUE`, `declaradoPor -> Usuario` (repartidor) y `recibidoPor -> Usuario` (empleado autorizado). | Cero o una conciliación por entrega en efectivo. El repartidor declara y el empleado de la sucursal registra lo recibido; diferencia requiere motivo. Rectificaciones excepcionales se documentan en `RegistroAuditoria`. | Esencial; decisión aprobada. |
| `Entrega` | Seguimiento del domicilio: `id UUID`, `estado EstadoEntrega`, `fechaCreacion DateTime`, `fechaRecogida DateTime?`, `fechaSalida DateTime?`, `fechaEntrega DateTime?`, `observaciones String?`, `montoEfectivoDeclarado Decimal?`. Estados: `PENDIENTE_ASIGNACION`, `ASIGNADA`, `RECOGIDA`, `EN_CAMINO`, `ENTREGADA`, `NO_ENTREGADA`. | PK `id`; FK `pedidoId NOT NULL UNIQUE`, `repartidorId?`. | Un pedido de domicilio tiene 0..1 entregas; una entrega pertenece a exactamente un pedido domicilio. Sucursal responsable deriva de `Pedido.sucursalId`; repartidor es `Usuario` opcional. El monto declarado es nulo hasta que el repartidor registre el recaudo; la conciliación lo copia a `ConciliacionEfectivo`. | Esencial; sin FK redundante a sucursal. |
| `ConfiguracionDomicilio` | Parámetros generales: `id UUID`, `tarifa Decimal`, `activo Boolean`, `fechaActualizacion DateTime`; tarifa inicial configurable de 2.000 COP y cobertura inicial Neiva. | PK `id`; no tiene FK a sucursal; configuración general del negocio. | No se ha aprobado historial/versionado de tarifas para el MVP; mantener configuración vigente sin agregar entidad histórica. | Esencial; sin historial de versiones en el MVP. |
| `SolicitudReposicion` | Encabezado: `id UUID`, `estado EstadoSolicitudReposicion`, `fechaSolicitud DateTime`, `fechaRevision DateTime?`, `observaciones String?`, `motivoRechazo String?`. | PK `id`; FKs `sucursalSolicitanteId`, `sucursalProveedoraId`, `solicitadaPor`, `revisadaPor?`. | 1:N detalles; 1:N despachos. Estados: `PENDIENTE_REVISION`, `RECHAZADA`, `EN_PROCESO`, `COMPLETADA`; `BORRADOR` solo si el flujo requiere guardar sin enviar. | Esencial; estados aprobados. |
| `DetalleSolicitudReposicion` | `cantidadSolicitada Integer`, `cantidadAprobada Integer?`; cierre previo opcional: `cantidadFaltanteCerrada Integer?`, `motivoCierre String?`, `fechaCierre DateTime?`, `cerradoPor UUID?`; reversa total opcional: `fechaReversa DateTime?`, `revertidoPor UUID?`, `motivoReversa String?`. | PK `id`; FKs `solicitudId`, `productoId`, `cerradoPor?`, `revertidoPor?`; `UNIQUE(solicitudId, productoId)`. | M:1 solicitud/producto; 1:N detalles de despacho. Un cierre máximo y reversa total máxima. | Esencial; cierre previo al despacho. |
| `DespachoReposicion` | Evento: `id UUID`, fecha, responsable, observación y datos de anulación opcionales (`anuladoEn?`, `anuladoPor?`, `motivoAnulacion?`). | PK `id`; FK `solicitudId`, `despachadoPor`, `anuladoPor?`. | M:1 solicitud; 1:N detalles. Si puede anularse con seguridad, se conserva el evento y se registra el despacho correcto como nuevo. La anulación documental no cambia inventario automáticamente. | Esencial; anulación completa aprobada. |
| `DetalleDespachoReposicion` | `cantidadEnviada Integer > 0`; cierre posterior opcional: `cantidadFaltanteCerrada Integer?`, `motivoCierre String?`, `fechaCierre DateTime?`, `cerradoPor UUID?`; reversa total opcional: `fechaReversa DateTime?`, `revertidoPor UUID?`, `motivoReversa String?`. | PK `id`; FK `despachoId`, `detalleSolicitudId`, `cerradoPor?`, `revertidoPor?`; `UNIQUE(despachoId, detalleSolicitudId)`. | M:1 despacho y M:1 detalle solicitado; 1:N detalles de recepción. Un cierre máximo y reversa total máxima. | Esencial; cierre posterior al despacho. |
| `RecepcionReposicion` | Evento: `id UUID`, fecha, observaciones, responsable y datos de anulación opcionales (`anuladoEn?`, `anuladoPor?`, `motivoAnulacion?`). | PK `id`; FKs `despachoId`, `responsableId`, `anuladoPor?`. | M:1 despacho; 1:N detalles. Si puede anularse con seguridad, se conserva y se registra una recepción nueva. La anulación documental no cambia inventario automáticamente. | Esencial; anulación completa aprobada. |
| `DetalleRecepcionReposicion` | `cantidadApta Integer >= 0`, `cantidadDañada Integer >= 0`; total recibido se deriva como su suma. | PK `id`; FK `recepcionId`, `detalleDespachoId`; `UNIQUE(recepcionId, detalleDespachoId)`. | M:1 recepción y M:1 detalle despachado; deben corresponder al mismo despacho. | Esencial; trazabilidad por línea. |
| `HorarioSucursal` | Intervalo por día: `id UUID`, `diaSemana DiaSemana`, `horaApertura Time`, `horaCierre Time`, `activo Boolean`. | PK `id`; FK `sucursalId`. | M:1 sucursal; único `(sucursalId, diaSemana)` en modelo actual. Excepciones/festivos no modelados. | Esencial; UML base. |
| `RegistroAuditoria` | Acciones administrativas importantes: `id UUID`, `fechaHora DateTime`, `operacion String`, `entidad String`, `entidadId UUID?`, `valorAnterior JSON?`, `valorNuevo JSON?`, `descripcion String?`, `tipoActor`, `usuarioId?`. | PK `id`; FK opcional `usuarioId`; sin FK a sucursal salvo necesidad confirmada. | Actor humano o sistema; no duplica pagos, inventario, despachos, recepciones, cierres ni conciliaciones operacionales, que tienen sus propios registros. | Simplificable; alcance limitado a eventos administrativos importantes. |

### Entidades asociativas condicionales, exclusiones y duplicados

- `UsuarioRol` implementa la relación M:N confirmada entre `Usuario` y `Rol`, con PK compuesta por ambas FK.
- `UsuarioSucursal` implementa la relación M:N confirmada entre `Usuario` y `Sucursal`, con PK compuesta por ambas FK.
- No agregar `Repartidor`: es `Usuario` con rol.
- No agregar `DetalleCuenta`: la cuenta se calcula a partir de pedidos aceptados.
- No agregar una entidad `Incidencia` en el MVP según la regla reportada más reciente: estado y observaciones viven en `Entrega`.
- `ConciliacionEfectivo` conserva únicamente el registro simple aprobado de monto declarado/recibido y motivo obligatorio ante diferencia; no crear `DetalleConciliacion` ni flujo avanzado. El pago en efectivo del cliente sigue registrado en `Pago`.
- En la propuesta, los datos del comprobante pertenecen a un intento `Pago`; no mantenerlos también en una entidad `ComprobantePago` separada.
- `cantidadEnviada`/`cantidadRecibida` no deben duplicarse en `DetalleSolicitudReposicion` si ya se derivan de detalles de despacho/recepción.
- Los enums `TipoSucursal`, `EstadoPedido`, `EstadoPago`, `MetodoPago`, etc. son dominios de atributos, no entidades por sí mismos salvo que luego se requiera catálogo administrable.

## Relaciones y cardinalidades que deben reflejarse

- `Sucursal` 1:N `InventarioSucursal`; clave única por `(sucursal, producto)`. `MovimientoInventario` referencia a `InventarioSucursal`, sin duplicar FKs a producto y sucursal.
- `Producto` 1:N `InventarioSucursal` y 1:N `DetallePedido`.
- `Pedido` 1:N `DetallePedido`; detalle con precio y nombre históricos del producto.
- `Usuario` M:N `Rol` mediante `UsuarioRol`; `Usuario` M:N `Sucursal` mediante `UsuarioSucursal`. Permisos concretos por rol/sucursal aún requieren matriz funcional.
- `Sucursal` 1:N `Mesa`; cada `Mesa` puede tener historial de sesiones, con a lo sumo una sesión activa y una cuenta abierta a la vez.
- `SesionMesa` y `CuentaMesa` se vinculan obligatoriamente 1:1; `CuentaMesa.sesionMesaId` es `NOT NULL UNIQUE`. Cada pedido QR apunta a una cuenta y varios pedidos aceptados pueden acumularse en ella.
- `Pago` tiene exactamente uno de los dos vínculos: un pedido externo o una cuenta de mesa; nunca ambos ni ninguno. La referencia a `Pedido` no puede apuntar a un pedido QR.
- `Entrega` aplica solo a un pedido a domicilio; puede estar inicialmente sin repartidor. Una `Usuario` repartidora puede tener varias entregas. Estados aprobados: `PENDIENTE_ASIGNACION`, `ASIGNADA`, `RECOGIDA`, `EN_CAMINO`, `ENTREGADA`, `NO_ENTREGADA`.
- `SolicitudReposicion` registra dos vínculos distintos a `Sucursal`: solicitante secundaria y proveedora principal. Un usuario solicita y un usuario autorizado revisa.
- `SolicitudReposicion` contiene detalles y puede generar múltiples `DespachoReposicion` (1:N).
- Cada despacho contiene `DetalleDespachoReposicion` con las cantidades realmente enviadas por producto solicitado.
- Cada `DespachoReposicion` puede tener múltiples `RecepcionReposicion` parciales (1:N); cada recepción referencia exactamente un despacho.
- Cada recepción contiene `DetalleRecepcionReposicion`, relacionado con el detalle despachado correspondiente y con cantidades recibidas aptas y dañadas.
- No hay límite funcional fijo a despachos o recepciones por solicitud. La regla anterior de una recepción máxima queda descartada.
- `HorarioSucursal`: como máximo un registro por sucursal y día.
- `RegistroAuditoria` contiene solo eventos administrativos importantes; puede identificar actor de sistema sin usuario. Los eventos operativos ya tienen entidad propia.

## Restricciones de integridad requeridas

- No duplicar inventario de un producto en la misma sucursal.
- Mantener restricciones de una sesión activa y una cuenta abierta por mesa.
- No permitir pago asociado a ambos tipos de origen o a ninguno.
- No asociar una entrega a pedido distinto de domicilio.
- Los detalles dependen de su entidad principal.
- No permitir stock negativo ni consumo duplicado; aceptar pedido y ajustar stock en una operación atómica.
- No confirmar un intento de pago mayor que el saldo. Si se registra un reembolso, será manual, a lo sumo uno y total; actor/fecha/motivo se guardan en `Pago`.
- Calcular cantidades de reposición pendientes desde solicitudes/despachos/recepciones; no duplicar contadores derivados.
- Registrar el cierre final de faltante y su posible reversa total en el detalle de solicitud o de despacho cuyo saldo afectan.
- Conservar despachos y recepciones originales; corregir anulando el evento completo cuando sea seguro y registrando uno nuevo. No usar deltas.
- La gestión formal de devoluciones de entregas fallidas está fuera del MVP; los productos que regresen físicamente no se incorporan automáticamente al stock disponible.
- La cantidad despachada acumulada por detalle no puede superar la cantidad aprobada.
- La cantidad recibida acumulada por detalle de despacho no puede superar la cantidad enviada.
- Los movimientos compensatorios son nuevos registros independientes de `MovimientoInventario`; los movimientos pendientes no afectan existencia disponible.

## Transición a la implementación

1. El MER lógico de 24 entidades de dominio y 2 asociativas fue aprobado el 22-11-2026; no se reabren entidades ni cardinalidades.
2. El modelo físico, nulabilidad, estados, tipos, unicidades e índices se especifican en [modelo-fisico-postgresql.md](modelo-fisico-postgresql.md).
3. Las entidades JPA y las migraciones Flyway V1/V2 se prepararon en `backend/`, conservando las 26 entidades. No se han ejecutado contra PostgreSQL.
4. Flyway y el arranque completo permanecen sin probar hasta definir y autorizar una base/esquema local de prueba aislado. No inventar nombre de base, credenciales, coordenadas ni stock.
5. El siguiente paso técnico es verificar con JDK 25 y, tras autorización del destino, validar mapeos, restricciones y transacciones con PostgreSQL.

## Fuente

[Chats de recepción parcial](https://chatgpt.com/share/6b01d0d0-fd70-83e9-b681-8e1f6b1baf3b) y [refinamiento UML](https://chatgpt.com/share/6b01d0f1-4d10-83e9-a5e7-6e075dedce85), aclaración directa del usuario del 21-11-2026 y [relaciones MER](https://chatgpt.com/share/6b01d114-7e04-83e9-bb40-c135412f6824).

## Reglas de cantidades y cierre de faltantes

Los cierres se registran en el mismo detalle cuyo saldo afectan. No existe `CierreFaltanteReposicion` ni otra entidad de cierre.

- **Antes del despacho:** `DetalleSolicitudReposicion` guarda cantidad faltante cerrada, motivo, fecha/hora, responsable y, si se revierte, fecha/hora, responsable y motivo de reversa.
- **Después del despacho:** esos mismos datos viven en `DetalleDespachoReposicion`; este cierre solo afecta el saldo de recepción de esa línea despachada.
- Cada detalle admite un único cierre y, como máximo, una reversa total. Los datos originales de cierre permanecen. No hay reversas parciales ni ciclos adicionales.
- `cierreVigente = cantidadFaltanteCerrada` si `fechaReversa` es nula; en otro caso, cero. Reversa total requiere actor, fecha y motivo; esos campos deben estar vacíos si no hay reversa.
- `pendienteDespacho = cantidadAprobada - suma(cantidadesEnviadas vigentes) - cierreVigentePrevio`. La reversa previa vuelve a sumar al pendiente de despacho.
- Para cada línea despachada: `pendienteRecepcion = cantidadEnviada vigente - suma(cantidadesAptas + cantidadesDañadas recibidas vigentes) - cierreVigentePosterior`. La reversa posterior vuelve a sumar al pendiente de recepción.
- Nunca descontar el cierre previo del saldo de recepción ni el posterior del saldo de despacho. La cantidad cerrada debe ser positiva y no superar el saldo abierto al momento del cierre.
- Lo dañado cuenta como recibido físicamente, pero solo lo apto incrementa el inventario disponible. El total recibido se deriva; no se duplica como atributo.

## Correcciones de despachos, recepciones e inventario

Los eventos originales se conservan y sus cantidades no se editan ni borran para corregirlos. Cuando sea seguro gestionar dependencias, se anula por completo el despacho o recepción y se registra uno nuevo. La anulación conserva motivo, actor y fecha en el evento. No hay eventos correctivos por delta.

La anulación documental no altera automáticamente `InventarioSucursal`. Todo movimiento compensatorio es un nuevo registro de `MovimientoInventario`; el original permanece inalterado. El usuario aprobó una compensación total como máximo por movimiento original, sin parcialidad ni encadenamiento. `movimientoCompensadoId` es una FK autorreferenciada opcional y única. Java valida el tipo de vínculo, la operación inversa, el mismo inventario y que el original no haya sido compensado. Un trigger bloquea UPDATE/DELETE de movimientos. Un movimiento pendiente no afecta la existencia disponible; toda transacción preserva saldo no negativo. Si el producto ya fue consumido, el caso queda para revisión administrativa, sin alterar ventas ni reincorporar productos devueltos.

Para el MVP, Java valida que `idOrigen` exista y corresponda al proceso identificado por `tipoOrigen`. La creación se realiza exclusivamente mediante servicios autorizados del backend; no se permiten escrituras que omitan esas validaciones. Los movimientos originales son inmutables.

## Restricciones de base de datos y de aplicación

| Regla | Control propuesto | Comentario |
| --- | --- | --- |
| PK/FK y eliminación de padre con hijos | Base de datos: PK, FK y `RESTRICT`/soft-delete | Compatible con desactivar, no borrar físicamente, productos/sucursales. |
| Inventario único por producto/sucursal | Base de datos: `UNIQUE(sucursalId, productoId)` | Restricción directa. |
| Horario único por sucursal/día | Base de datos: `UNIQUE(sucursalId, diaSemana)` | Un intervalo diario es la regla informada; excepciones no están modeladas. |
| Un solo origen de pago | Base de datos: XOR de `pedidoId` y `cuentaMesaId` más FKs | Necesita `CHECK` (o mecanismo equivalente). |
| Una entrega por pedido | Base de datos: `UNIQUE(pedidoId)` | La regla de máximo una entrega por pedido domiciliario se establece en la instrucción actual; validar en aplicación que el pedido sea de domicilio. |
| Una sesión activa y una cuenta abierta por mesa | Base de datos: índice único parcial si está disponible; además transacción | Define unicidad solo en estados activos/abiertos. |
| Cantidades positivas/no negativas, aprobada <= solicitada | Base de datos: `CHECK` por fila | Se puede expresar localmente por fila. |
| Acumulados enviados <= aprobado y recibidos <= enviados | Lógica transaccional de aplicación, protegiendo las filas involucradas; también puede añadirse trigger tras decidir DBMS | Son sumas entre filas, no un `CHECK` simple. |
| Devolución de stock y confirmación atómica | Transacción de aplicación + restricciones de stock | Evitar doble aceptación concurrente y stock negativo. |
| Actor autorizado, sucursal y transición de estados | Lógica de autorización/aplicación | Depende de usuario, roles, sede, estado previo y operación. |
| Un cierre y una reversa total como máximo por detalle | Campos de cierre/reversa opcionales en el detalle; validación de conjunto de campos y transacción | Reversa solo si existe cierre vigente; no admite parcialidad ni segundo ciclo. |
| Reembolso manual total como máximo una vez por pago | Lógica de negocio y autorización; transacción al registrar | Confirmar que el pago está confirmado y que aún no fue reembolsado; el monto es el total pagado, no se permite parcialidad. |
| Token de sesión, código de seguimiento, expiración | Generación segura y validación de aplicación; unicidad en DB | No confiar en predicción ni en cliente. |

## Resolución de inconsistencias históricas

### Inconsistencias históricas y resolución incorporada al MER aprobado

1. **Conteos históricos 22 y 27:** son inventarios de etapas anteriores y no equivalen al modelo vigente. El conteo aprobado se detalla al final; no se agrega entidad de cierre.
2. **Reposición de una recepción vs. parcial:** decisión anterior de una recepción máxima queda descartada por confirmación explícita de múltiples despachos/recepciones. Este MER ya refleja 1:N.
3. **`RecepcionReposicion` sin detalle previo:** no se puede rastrear por producto qué parte de un despacho llegó dañada o apta. `DetalleRecepcionReposicion` debe relacionarse con `DetalleDespachoReposicion`, no solo con producto/solicitud.
4. **Contadores de envío/recepción duplicados en detalle solicitado:** deben quitarse de `DetalleSolicitudReposicion`; los acumulados se derivan de los detalles históricos.
5. **`fechaEnvio` en encabezado de solicitud:** ambiguo para envíos múltiples. Retirar o reemplazar por fechas derivadas de cada despacho.
6. **Pagos y reembolsos duplicados:** comprobante (máximo uno por intento) y datos del reembolso manual total residen en `Pago`; no hay `ComprobantePago` ni `Reembolso` separados.
7. **Auditoría genérica vs. operacional:** `RegistroAuditoria` se limita a acciones administrativas importantes; Pago, MovimientoInventario, despachos, recepciones y cierres conservan su propio historial operacional.
8. **Asignación de usuario a roles/sucursales:** el usuario confirmó directamente M:N para ambas relaciones; `UsuarioRol` y `UsuarioSucursal` usan PK compuestas por sus FK en el modelo aprobado.

### Criterios de implementación física

- Los tipos SQL, nulabilidad, índices, restricciones y nombres físicos están definidos en [modelo-fisico-postgresql.md](modelo-fisico-postgresql.md).
- Los estados de pedido, pago, entrega, sesión, cuenta y reposición se restringen a los valores definidos por los requisitos y el documento físico.
- Las reglas entre varias filas se implementan en Java con transacciones y bloqueos; las restricciones locales se respaldan con CHECK, UNIQUE y FK.
- Se conserva el historial mediante desactivación en catálogos y operaciones append-only donde el MER lo establece.
- El MER conserva 26 entidades. Coordenadas de sucursal, modalidad de entrega en pedido y vínculo de compensación son atributos de entidades existentes, justificados por decisiones funcionales aprobadas.

Esta revisión lógica fue aprobada por el usuario el 22-11-2026. Las versiones históricas de este documento que la describían como propuesta quedan sustituidas por esta aprobación.

## Historial: conciliación técnica de las 27 candidatas

Esta sección conserva el razonamiento de una revisión anterior. Sus estados de “candidata” o “sujeta a cierre” son históricos y quedan sustituidos por el inventario lógico aprobado en las tablas de este documento y el esquema físico enlazado arriba. No reabre decisiones posteriores del usuario.

| Grupo | Entidades | Resultado |
| --- | --- | --- |
| 20 clases originales | `Usuario`, `Rol`, `Sucursal`, `Categoria`, `Producto`, `InventarioSucursal`, `MovimientoInventario`, `Pedido`, `DetallePedido`, `Mesa`, `SesionMesa`, `CuentaMesa`, `Pago`, `Entrega`, `ConfiguracionDomicilio`, `SolicitudReposicion`, `DetalleSolicitudReposicion`, `RecepcionReposicion`, `HorarioSucursal`, `RegistroAuditoria` | Se mantienen en el modelo vigente; los atributos y la nulabilidad ya constan en el modelo físico. |
| Incorporadas después | `ComprobantePago`, `MovimientoBancario`, `Reembolso`, `ConciliacionEfectivo`, `DespachoReposicion`, `DetalleDespachoReposicion`, `DetalleRecepcionReposicion` | Se mantienen las tres entidades de reposición y `ConciliacionEfectivo` en alcance mínimo por la regla previamente aprobada de registrar diferencias. `ComprobantePago` y `Reembolso` se fusionan en `Pago`; `MovimientoBancario` se descarta. |
| Asociativas | `UsuarioRol`, `UsuarioSucursal` | Se incorporan como tablas puente por la relación M:N confirmada por el usuario. PK compuesta formada por ambas FK; no agregan atributos de dominio por ahora. |
| Cierres de faltantes | Campos en `DetalleSolicitudReposicion` y `DetalleDespachoReposicion` | No es una entidad independiente. Cada detalle puede tener un cierre y una reversa total como máximo. |
| Fusionadas o descartadas | `ComprobantePago`, `Reembolso`, `MovimientoBancario` | Comprobante y datos del reembolso total manual viven en `Pago`; no hay clases separadas. `MovimientoBancario` no aporta flujo sin integración bancaria. |
| No entidades | `Repartidor`, `Incidencia`, `DetalleCuenta`, `DetalleConciliacion` | Repartidor es usuario con rol; incidencia usa estado/observación; cuenta se consulta por pedido. La conciliación mínima no necesita entidad detalle. |

**Conteo definitivo del modelo actual:** 24 entidades de dominio y 2 entidades asociativas (`UsuarioRol`, `UsuarioSucursal`), para 26 entidades/tablas lógicas. El conteo se obtiene del inventario vigente, no de los catálogos históricos. `CierreFaltanteReposicion`, `ComprobantePago`, `Reembolso`, `MovimientoBancario` y `CorreccionReposicion` no son entidades del MVP.

### Relaciones M:N confirmadas

- `Usuario` M:N `Rol` mediante `UsuarioRol(usuarioId, rolId)`. PK compuesta `(usuarioId, rolId)`; ambas son FK requeridas y únicas como pareja. Cardinalidades de lectura: un usuario puede tener 0..N roles; un rol puede pertenecer a 0..N usuarios.
- `Usuario` M:N `Sucursal` mediante `UsuarioSucursal(usuarioId, sucursalId)`. PK compuesta `(usuarioId, sucursalId)`; ambas son FK requeridas y únicas como pareja. Un usuario puede operar en 0..N sucursales y una sucursal tener 0..N usuarios.
- La asignación por rol y sucursal es M:N. No existen permisos individuales configurables ni se exige doble autorización por defecto; el administrador no hereda permisos operativos.
- Restringir eliminación física de usuarios, roles o sucursales con asociaciones; usar desactivación o desasociación trazable.

### `SesionMesa`, `CuentaMesa` y `Pedido`

- La relación `SesionMesa`–`CuentaMesa` es obligatoria 1:1: cada sesión tiene una cuenta y cada cuenta una sesión. `CuentaMesa.sesionMesaId` es `NOT NULL UNIQUE` y FK a sesión.
- Al abrir sesión se crea la cuenta dentro de la misma transacción. La FK y la unicidad impiden cuentas huérfanas o dos cuentas por sesión; que toda sesión tenga cuenta se garantiza al completar atómicamente la operación de apertura.
- El cierre de sesión invalida el token QR. Sesión y cuenta se cierran independientemente; una cuenta puede seguir abierta para cobrar y bloquea una nueva sesión en esa mesa.

- `Pedido.cuentaMesaId` es nullable para permitir pedidos externos y requerido para `tipo = QR_MESA`.
- Una `CuentaMesa` pertenece exactamente a una `SesionMesa` y cada sesión tiene exactamente una cuenta. Una cuenta puede contener 0..N pedidos; cada pedido QR pertenece a exactamente una cuenta. Los pedidos externos tienen `cuentaMesaId = NULL`.
- El enlace se materializa directamente en `Pedido`; no existe `DetalleCuenta`, porque la cuenta agrega/deriva sus pedidos aceptados.
- Validar la coherencia entre `tipoPedido`, sucursal de la cuenta, sesión y mesa en lógica de aplicación/transacción, ya que se cruzan tablas.

### `Entrega` y `Pedido`

- Un pedido de domicilio puede tener 0..1 entregas; una entrega pertenece exactamente a un pedido.
- `Entrega.pedidoId` es `NOT NULL`, FK y `UNIQUE`. La unicidad implementa máximo una entrega por pedido.
- `Entrega` no almacena FK `sucursalId`; la sucursal responsable deriva de `Pedido.sucursalId`.
- La condición “el pedido es de domicilio” requiere validación de aplicación/transacción o trigger, porque `tipoPedido` reside en `Pedido`.

### `Pago` y comprobante

La decisión vigente es **fusionar `ComprobantePago` en `Pago` para el MVP**. Cada fila `Pago` es un intento distinto, con su propio método, importe, estado y, si corresponde, archivo de comprobante, fecha de carga, quién verificó, fecha de verificación y motivo de rechazo. No se requiere más de un comprobante por intento. Esta decisión elimina doble fuente de verdad y conserva intentos aunque se borre el archivo rechazado.

`MovimientoBancario` se descarta del MVP: no hay integración bancaria y la verificación de transferencia es manual. `Reembolso` se fusiona en `Pago`: a lo sumo un reembolso manual, total, con estado, fecha, motivo y actor; no se almacena un importe separado si equivale al total confirmado ni se crea relación 1:N. Cuando el estado indica reembolso, fecha, motivo y responsable deben ser obligatorios; si no está reembolsado, esos campos quedan nulos. No se permite el reembolso antes de confirmar el pago. El efectivo cobrado al cliente se registra en `Pago`; por separado, `ConciliacionEfectivo` registra solo la entrega/declaración del dinero recaudado por repartidor a sucursal y exige motivo si hay diferencia. No incluye integración bancaria, arqueo avanzado ni liquidaciones parciales.

### Cantidades y trazabilidad del módulo de reposiciones

- `SolicitudReposicion` 1:N `DetalleSolicitudReposicion` 1:N `DetalleDespachoReposicion` N:1 `DespachoReposicion` N:1 `SolicitudReposicion`.
- `DespachoReposicion` 1:N `DetalleDespachoReposicion` y 1:N `RecepcionReposicion`.
- `RecepcionReposicion` 1:N `DetalleRecepcionReposicion`; cada detalle apunta a exactamente un `DetalleDespachoReposicion`, dando cadena de trazabilidad hasta detalle solicitado y solicitud.
- Por detalle solicitado: `pendienteDespacho = cantidadAprobada - suma(cantidadEnviada de despachos no anulados) - cierreVigentePreDespacho`.
- Por detalle de despacho: `pendienteRecepcion = cantidadEnviada de despacho no anulado - suma(cantidadApta + cantidadDañada recibidas no anuladas) - cierreVigentePostDespacho`.
- `cantidadAptaRecibida >= 0`, `cantidadDañadaRecibida >= 0`; el total físico recibido es su suma. Apta + dañada no puede superar la cantidad despachada neta para esa línea.
- Cantidades aprobadas no superan las solicitadas. Cantidades enviadas acumuladas no superan las aprobadas menos cierres previos al despacho. Recepción más cierres post-despacho no superan lo enviado.
- La reversa total vuelve `cierreVigente` a cero y restaura el saldo correspondiente; los datos del cierre no se borran ni sobrescriben.
- Despachos y recepciones originales se conservan. Para corregir, se anula el evento completo (si es seguro) y se registra uno nuevo; no se usan deltas correctivos.

### Restricciones por mecanismo

**Base de datos:** PK/FK; PK compuestas de puentes; unicidades de inventario, horarios y líneas; `CuentaMesa.sesionMesaId`, `Entrega.pedidoId` y `ConciliacionEfectivo.entregaId` únicas y requeridas. `CHECK` de XOR de origen de `Pago`; cantidades positivas/no negativas, cantidad aprobada <= solicitada; y campos coherentes del cierre/reversa (actor, fecha y motivo presentes juntos). `Pedido.cuentaMesaId` es opcional solo para externo y requerido para QR, con validación cruzada.

**Transacciones:** apertura de sesión/cuenta; aceptación y deducción de inventario; actualización de cantidades de despacho/recepción y cierre/reversa frente a saldos; recepción apta y aumento de stock; aplicar movimientos compensatorios sin stock negativo; pago/reembolso total; y cierre independiente de cuenta/sesión. Proteger saldos frente a concurrencia.

**Lógica de aplicación/autorización:** rol y sucursal del actor; administrador para anulaciones excepcionales; validar tipo de pedido para `Entrega` y `Pago`, reglas de estado, sesión QR, pertenencia de líneas a encabezados y sucursal; exigir un solo cierre y como máximo una reversa total por detalle; no permitir reversa si no hay cierre vigente. No confiar solo en validaciones de interfaz.

## Aprobación vigente

Las decisiones aprobadas conjuntamente el 21-11-2026 prevalecen sobre propuestas anteriores de este documento:

- Una conciliación por entrega: se conservan monto declarado, monto recibido, responsable declarante, empleado receptor y motivo si difieren. Rectificaciones excepcionales se documentan en `RegistroAuditoria`.
- Sesión y cuenta se crean conjuntamente y se cierran independientemente. No se abre sesión nueva mientras haya cuenta abierta en la mesa.
- Un comprobante como máximo por intento; cada reintento es otro `Pago`.
- Despachos y recepciones se corrigen anulando el evento completo y registrando uno nuevo, siempre que sus dependencias puedan tratarse con seguridad. El original permanece. Anular documentalmente no cambia inventario; los movimientos compensatorios son independientes.
- Una diferencia de inventario relativa a producto ya consumido se deriva a revisión administrativa; no se permite saldo negativo ni modificar ventas anteriores, y no se incorporan deudas, pérdidas automáticas ni regularizaciones complejas.
- No se incorpora `CierreFaltanteReposicion`. Un cierre final por línea se guarda en el detalle de solicitud (antes de despachar) o de despacho (después), con cantidad, motivo, fecha y responsable.
- Estados de solicitud: `PENDIENTE_REVISION`, `RECHAZADA`, `EN_PROCESO`, `COMPLETADA`; `BORRADOR` solo si el flujo realmente requiere guardar sin enviar. Los pendientes se calculan desde las cantidades registradas.
- Permisos por rol y sucursal con asociaciones existentes; no hay permisos individuales ni doble autorización por defecto. Personal autorizado de inventario gestiona reposiciones; administrador interviene en anulaciones excepcionales. Una persona puede registrar y autorizar operaciones ordinarias.

El usuario aprobó el MER lógico consolidado el 22-11-2026: se conservan 24 entidades de dominio y 2 asociativas, total 26. El origen de `MovimientoInventario` se identifica mediante `tipoOrigen` e `idOrigen`, validados en Java; no se agregan FKs opcionales a cada entidad de origen. La relación compensatoria se implementa con FK autorreferenciada opcional y única, con compensación total como máximo una vez y sin cadenas. El diseño físico no agrega entidades ni cambia las cardinalidades aprobadas.
