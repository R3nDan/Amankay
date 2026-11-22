# Modelo físico PostgreSQL — Amankay

## Estado y alcance

Este diseño implementa el MER aprobado de **24 entidades de dominio y 2 asociativas (26 tablas)**. Las adiciones de atributos descritas aquí no crean entidades. La migración es acumulativa, no elimina tablas ni datos y no se ha ejecutado contra ninguna base de datos.

PostgreSQL usa UUID, importes NUMERIC(12,2) en COP, fechas-hora TIMESTAMPTZ en UTC, estados VARCHAR restringidos por CHECK y datos administrativos JSONB. JPA usa ddl-auto=none; Flyway es el único mecanismo para evolucionar el esquema y permanece deshabilitado por defecto.

## Tablas y nulabilidad

Las columnas descritas como opcionales aceptan NULL; las demás son NOT NULL. Las entidades usan PK UUID.

| Tabla / entidad | Columnas físicas |
|---|---|
| usuario — Usuario | id UUID; nombre VARCHAR(80); apellido VARCHAR(80); correo VARCHAR(254); telefono VARCHAR(30); password_hash VARCHAR(100); activo BOOLEAN; fecha_creacion TIMESTAMPTZ; ultimo_acceso TIMESTAMPTZ opcional. Correo único sin distinguir mayúsculas. |
| rol — Rol | id UUID; nombre VARCHAR(40); descripcion VARCHAR(240) opcional. Nombre único. |
| sucursal — Sucursal | id UUID; nombre VARCHAR(100); direccion VARCHAR(240); telefono VARCHAR(30) opcional; tipo VARCHAR(20); activa BOOLEAN; fecha_creacion TIMESTAMPTZ; latitud y longitud NUMERIC(9,6) opcionales. Las coordenadas son atributos de esta entidad existente para decidir proximidad cuando el cliente comparte GPS; no se almacenan coordenadas del cliente. |
| usuario_rol — UsuarioRol | PK compuesta (usuario_id, rol_id); ambas columnas son FK requeridas. |
| usuario_sucursal — UsuarioSucursal | PK compuesta (usuario_id, sucursal_id); ambas columnas son FK requeridas. |
| categoria — Categoria | id UUID; nombre VARCHAR(100); descripcion VARCHAR(300) opcional; activa BOOLEAN. Nombre único sin distinguir mayúsculas. |
| producto — Producto | id UUID; categoria_id UUID; nombre VARCHAR(120); descripcion VARCHAR(500) opcional; imagen VARCHAR(500) opcional; precio NUMERIC(12,2); activo BOOLEAN; fecha_creacion y fecha_actualizacion TIMESTAMPTZ. Nombre único sin distinguir mayúsculas; precio no negativo. |
| inventario_sucursal — InventarioSucursal | id UUID; sucursal_id UUID; producto_id UUID; stock_disponible INTEGER; fecha_actualizacion TIMESTAMPTZ. Pareja sucursal/producto única; stock no negativo. No se inventan saldos iniciales. |
| movimiento_inventario — MovimientoInventario | id UUID; inventario_sucursal_id UUID; usuario_id UUID opcional; tipo VARCHAR(32); cantidad INTEGER; stock_anterior y stock_resultante INTEGER; fecha_hora TIMESTAMPTZ; motivo VARCHAR(500); tipo_origen VARCHAR(40); id_origen UUID; movimiento_compensado_id UUID opcional y único. La FK autorreferenciada señala el movimiento original compensado. |
| pedido — Pedido | id UUID; codigo_seguimiento VARCHAR(32); tipo VARCHAR(16); canal_origen VARCHAR(16); modalidad_entrega VARCHAR(16) opcional; estado VARCHAR(32); fecha_creacion TIMESTAMPTZ; fecha_vencimiento TIMESTAMPTZ opcional (pedido web, 30 minutos); total NUMERIC(12,2); costo_domicilio_historico NUMERIC(12,2) opcional; sucursal_id UUID opcional durante la confirmación de domicilio sin GPS; cuenta_mesa_id UUID opcional; nombre_cliente VARCHAR(160) opcional; telefono_cliente VARCHAR(30) opcional; direccion_entrega VARCHAR(240) opcional; barrio VARCHAR(120) opcional; referencia_direccion VARCHAR(240) opcional; ubicacion_consentida BOOLEAN; latitud_entrega y longitud_entrega NUMERIC(9,6) opcionales; nombre_destinatario VARCHAR(160) opcional; telefono_destinatario VARCHAR(30) opcional. Con GPS, dirección/barrio son opcionales y las coordenadas consentidas se conservan para el repartidor; sin GPS, dirección/barrio son obligatorios. Java exige sucursal antes de aceptar un pedido externo. |
| detalle_pedido — DetallePedido | id UUID; pedido_id UUID; producto_id UUID; cantidad INTEGER; precio_unitario_historico NUMERIC(12,2); nombre_producto_historico VARCHAR(120). Cantidad positiva; precio no negativo. |
| mesa — Mesa | id UUID; sucursal_id UUID; identificador VARCHAR(40); identificador_qr VARCHAR(120); activa BOOLEAN. Identificadores únicos por sucursal. |
| sesion_mesa — SesionMesa | id UUID; mesa_id UUID; token_seguro VARCHAR(128); fecha_apertura TIMESTAMPTZ; fecha_cierre TIMESTAMPTZ opcional; estado VARCHAR(16); abierta_por UUID; cerrada_por UUID opcional. token_seguro contiene el hash del token, nunca el acceso en claro. Expiración configurable de 8 horas derivada de fecha_apertura. |
| cuenta_mesa — CuentaMesa | id UUID; sesion_mesa_id UUID único; fecha_apertura TIMESTAMPTZ; fecha_cierre TIMESTAMPTZ opcional; estado VARCHAR(16). Puede permanecer abierta después del cierre o expiración del token QR. |
| pago — Pago | id UUID; pedido_id UUID opcional; cuenta_mesa_id UUID opcional; metodo VARCHAR(20); estado VARCHAR(24); importe NUMERIC(12,2); fecha_creacion TIMESTAMPTZ; fecha_confirmacion TIMESTAMPTZ opcional; archivo VARCHAR(500) opcional; fecha_carga TIMESTAMPTZ opcional; verificado_por UUID opcional; fecha_verificacion TIMESTAMPTZ opcional; motivo_rechazo VARCHAR(500) opcional; reembolso_fecha TIMESTAMPTZ opcional; reembolso_motivo VARCHAR(500) opcional; reembolso_por UUID opcional; reembolso_estado VARCHAR(20) opcional. XOR entre pedido externo y cuenta. Cada intento cubre el saldo pendiente completo, sin sobrepago ni reembolso parcial. archivo es una clave opaca de almacenamiento privado. |
| conciliacion_efectivo — ConciliacionEfectivo | id UUID; entrega_id UUID único; monto_declarado y monto_recibido NUMERIC(12,2); fecha_conciliacion TIMESTAMPTZ; motivo_diferencia VARCHAR(500) opcional; declarado_por y recibido_por UUID. Si los montos difieren, el motivo es obligatorio. |
| entrega — Entrega | id UUID; pedido_id UUID único; repartidor_id UUID opcional; estado VARCHAR(24); fecha_creacion TIMESTAMPTZ; fecha_recogida, fecha_salida y fecha_entrega TIMESTAMPTZ opcionales; observaciones TEXT opcional; monto_efectivo_declarado NUMERIC(12,2) opcional y no negativo. El monto estructurado se actualiza por el repartidor y luego se copia a `ConciliacionEfectivo`; cada declaración queda en auditoría para conservar las rectificaciones. No existe entidad Incidencia o Devolución. |
| configuracion_domicilio — ConfiguracionDomicilio | id UUID; tarifa NUMERIC(12,2); activo BOOLEAN; fecha_actualizacion TIMESTAMPTZ. Una configuración vigente, sin historial de tarifas. |
| solicitud_reposicion — SolicitudReposicion | id UUID; sucursal_solicitante_id y sucursal_proveedora_id UUID; solicitada_por UUID; revisada_por UUID opcional; estado VARCHAR(24); fecha_solicitud TIMESTAMPTZ; fecha_revision TIMESTAMPTZ opcional; observaciones TEXT opcional; motivo_rechazo VARCHAR(500) opcional. |
| detalle_solicitud_reposicion — DetalleSolicitudReposicion | id UUID; solicitud_id UUID; producto_id UUID; cantidad_solicitada INTEGER; cantidad_aprobada INTEGER opcional; cantidad_faltante_cerrada INTEGER opcional; motivo_cierre VARCHAR(500) opcional; fecha_cierre TIMESTAMPTZ opcional; cerrado_por UUID opcional; fecha_reversa TIMESTAMPTZ opcional; revertido_por UUID opcional; motivo_reversa VARCHAR(500) opcional. Producto único por solicitud. |
| despacho_reposicion — DespachoReposicion | id UUID; solicitud_id UUID; despachado_por UUID; fecha_despacho TIMESTAMPTZ; observaciones TEXT opcional; anulado_en TIMESTAMPTZ opcional; anulado_por UUID opcional; motivo_anulacion VARCHAR(500) opcional. |
| detalle_despacho_reposicion — DetalleDespachoReposicion | id UUID; despacho_id UUID; detalle_solicitud_id UUID; cantidad_enviada INTEGER; cantidad_faltante_cerrada INTEGER opcional; motivo_cierre VARCHAR(500) opcional; fecha_cierre TIMESTAMPTZ opcional; cerrado_por UUID opcional; fecha_reversa TIMESTAMPTZ opcional; revertido_por UUID opcional; motivo_reversa VARCHAR(500) opcional. Pareja despacho/detalle de solicitud única. |
| recepcion_reposicion — RecepcionReposicion | id UUID; despacho_id UUID; responsable_id UUID; fecha_recepcion TIMESTAMPTZ; observaciones TEXT opcional; anulado_en TIMESTAMPTZ opcional; anulado_por UUID opcional; motivo_anulacion VARCHAR(500) opcional. |
| detalle_recepcion_reposicion — DetalleRecepcionReposicion | id UUID; recepcion_id UUID; detalle_despacho_id UUID; cantidad_apta y cantidad_danada INTEGER. Pareja recepción/detalle de despacho única; ambas cantidades no negativas. |
| horario_sucursal — HorarioSucursal | id UUID; sucursal_id UUID; dia_semana VARCHAR(12); hora_apertura y hora_cierre TIME; activo BOOLEAN. Una fila por sucursal y día. |
| registro_auditoria — RegistroAuditoria | id UUID; fecha_hora TIMESTAMPTZ; operacion VARCHAR(80); entidad VARCHAR(80); entidad_id UUID opcional; valor_anterior y valor_nuevo JSONB opcionales; descripcion VARCHAR(1000) opcional; tipo_actor VARCHAR(12); usuario_id UUID opcional. |

## Estados y dominios físicos

- Roles iniciales: ADMINISTRADOR, ATENCION, INVENTARIO, REPARTIDOR. Java aplica permisos y sucursales asignadas; administración no hereda permisos operativos.
- Pedido: PENDIENTE_CONFIRMACION, ACEPTADO, EN_PREPARACION, LISTO, COMPLETADO, RECHAZADO, CANCELACION_SOLICITADA, CANCELADO, VENCIDO.
- Pago: PENDIENTE, PENDIENTE_VERIFICACION, CONFIRMADO, RECHAZADO, REEMBOLSADO.
- Sesión QR: ACTIVA, CERRADA, EXPIRADA. Cuenta: ABIERTA, CERRADA.
- Entrega: PENDIENTE_ASIGNACION, ASIGNADA, RECOGIDA, EN_CAMINO, ENTREGADA, NO_ENTREGADA.
- Reposición: estados ya aprobados en el MER.
- Movimiento: ENTRADA_INICIAL, AJUSTE_POSITIVO, AJUSTE_NEGATIVO, MERMA, VENTA, DESPACHO_REPOSICION, RECEPCION_REPOSICION, COMPENSACION. Una merma se registra como salida identificable y requiere motivo.
- Origen de movimiento: DETALLE_PEDIDO, DETALLE_DESPACHO_REPOSICION, DETALLE_RECEPCION_REPOSICION, REGISTRO_AUDITORIA o MOVIMIENTO_COMPENSADO. Java valida que el registro exista, corresponda al tipo declarado y aplique al inventario correcto.
- Pago: EFECTIVO o TRANSFERENCIA; devolución manual total, sin movimiento automático de fondos.

El pedido web se guarda antes de abrir WhatsApp y queda PENDIENTE_CONFIRMACION. La comunicación de WhatsApp es externa y manual. Personal confirma desde el panel; tras 30 minutos sin confirmación, el pedido pasa a VENCIDO. No se reserva inventario antes de aceptar.

## Restricciones, índices e integridad

- FKs con ON DELETE RESTRICT. Productos, categorías, usuarios y sucursales se desactivan en vez de borrarse, preservando el historial.
- Unicidades: correo de usuario; nombre global de categoría y producto; inventario por sucursal/producto; mesa e identificador QR por sucursal; cuenta por sesión; XOR del origen de pago; entrega por pedido; conciliación por entrega; producto por solicitud; detalle solicitado por despacho; detalle despachado por recepción; una compensación referida por movimiento original.
- Índices: estado/fecha de pedido; sucursal/fecha; cuenta/fecha; estado de entrega y reposición; inventario por sucursal; origen de movimiento; código de seguimiento y token de sesión únicos.
- Checks: cantidades positivas/no negativas según operación; inventario no negativo; coordenadas dentro de rango y ambas nulas o ambas presentes; XOR de origen de pago; coherencia de tipo/canal/modalidad/cuenta del pedido; campos de cierre, reversa, anulación y reembolso coherentes; motivo obligatorio ante diferencias y ajustes.
- Restricciones entre varias filas —stock, saldos de pago, cantidades agregadas recibidas/enviadas y una sesión/cuenta abierta por mesa— se protegen mediante transacciones y bloqueo de filas en Java.
- Un trigger PostgreSQL rechaza UPDATE y DELETE de movimiento_inventario. La FK opcional movimiento_compensado_id conserva la relación de compensación; su unicidad permite como máximo una compensación. Java impide compensaciones parciales o encadenadas.

## Migraciones y protección

- V1__create_amankay_schema.sql crea las 26 tablas, restricciones, índices y el trigger de inmutabilidad.
- V2__seed_confirmed_catalog.sql carga categorías, productos, sucursales, horarios, roles y la tarifa de 2.000 COP ya confirmados por la documentación/frontend. No agrega usuarios, credenciales ni saldos de inventario inventados.
- Flyway sigue deshabilitado por defecto. La ejecución exige una base local desechable o esquema de prueba expresamente autorizado.

## Trazabilidad de MovimientoInventario

La decisión de compensación total, como máximo una por movimiento original, queda aprobada para el MVP. movimiento_compensado_id es una FK autorreferenciada opcional, única y sin encadenamiento. La compensación registra el delta inverso sobre el saldo actual, en una transacción, y conserva inmutable el original. Esto complementa, pero no reemplaza, tipo_origen + id_origen, que identifica la operación de negocio y se valida desde Java.

La inspección formal de productos que regresan de entregas fallidas sigue aplazada. No se generan movimientos para reingresarlos al stock disponible.
