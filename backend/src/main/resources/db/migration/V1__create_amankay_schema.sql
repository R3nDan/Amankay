CREATE TABLE rol (
    id UUID PRIMARY KEY,
    nombre VARCHAR(40) NOT NULL,
    descripcion VARCHAR(240),
    CONSTRAINT uq_rol_nombre UNIQUE (nombre)
);

CREATE TABLE sucursal (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(240) NOT NULL,
    telefono VARCHAR(30),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PRINCIPAL', 'SECUNDARIA')),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latitud NUMERIC(9,6),
    longitud NUMERIC(9,6),
    CONSTRAINT ck_sucursal_coordenadas_pareadas
        CHECK ((latitud IS NULL AND longitud IS NULL)
            OR (latitud BETWEEN -90 AND 90 AND longitud BETWEEN -180 AND 180))
);

CREATE TABLE usuario (
    id UUID PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    correo VARCHAR(254) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMPTZ,
    CONSTRAINT uq_usuario_correo UNIQUE (correo)
);
CREATE UNIQUE INDEX uq_usuario_correo_lower ON usuario (LOWER(correo));

CREATE TABLE usuario_rol (
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    rol_id UUID NOT NULL REFERENCES rol(id) ON DELETE RESTRICT,
    PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE usuario_sucursal (
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    sucursal_id UUID NOT NULL REFERENCES sucursal(id) ON DELETE RESTRICT,
    PRIMARY KEY (usuario_id, sucursal_id)
);

CREATE TABLE categoria (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300),
    activa BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE UNIQUE INDEX uq_categoria_nombre_lower ON categoria (LOWER(nombre));

CREATE TABLE producto (
    id UUID PRIMARY KEY,
    categoria_id UUID NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT,
    nombre VARCHAR(120) NOT NULL,
    descripcion VARCHAR(500),
    imagen VARCHAR(500),
    precio NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uq_producto_nombre_lower ON producto (LOWER(nombre));
CREATE INDEX ix_producto_categoria_activo ON producto (categoria_id, activo);

CREATE TABLE inventario_sucursal (
    id UUID PRIMARY KEY,
    sucursal_id UUID NOT NULL REFERENCES sucursal(id) ON DELETE RESTRICT,
    producto_id UUID NOT NULL REFERENCES producto(id) ON DELETE RESTRICT,
    stock_disponible INTEGER NOT NULL CHECK (stock_disponible >= 0),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_inventario_sucursal_producto UNIQUE (sucursal_id, producto_id)
);
CREATE INDEX ix_inventario_sucursal ON inventario_sucursal (sucursal_id);

CREATE TABLE movimiento_inventario (
    id UUID PRIMARY KEY,
    inventario_sucursal_id UUID NOT NULL REFERENCES inventario_sucursal(id) ON DELETE RESTRICT,
    usuario_id UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    tipo VARCHAR(32) NOT NULL CHECK (tipo IN ('ENTRADA_INICIAL','AJUSTE_POSITIVO','AJUSTE_NEGATIVO','MERMA','VENTA','DESPACHO_REPOSICION','RECEPCION_REPOSICION','COMPENSACION')),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    stock_anterior INTEGER NOT NULL CHECK (stock_anterior >= 0),
    stock_resultante INTEGER NOT NULL CHECK (stock_resultante >= 0),
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(500) NOT NULL CHECK (LENGTH(BTRIM(motivo)) > 0),
    tipo_origen VARCHAR(40) NOT NULL CHECK (tipo_origen IN ('DETALLE_PEDIDO','DETALLE_DESPACHO_REPOSICION','DETALLE_RECEPCION_REPOSICION','REGISTRO_AUDITORIA','MOVIMIENTO_COMPENSADO')),
    id_origen UUID NOT NULL,
    movimiento_compensado_id UUID UNIQUE REFERENCES movimiento_inventario(id) ON DELETE RESTRICT,
    CONSTRAINT ck_movimiento_stock_delta CHECK (
        (tipo IN ('ENTRADA_INICIAL','AJUSTE_POSITIVO','RECEPCION_REPOSICION') AND stock_resultante >= stock_anterior)
        OR (tipo IN ('AJUSTE_NEGATIVO','MERMA','VENTA','DESPACHO_REPOSICION') AND stock_resultante <= stock_anterior)
        OR tipo = 'COMPENSACION'
    ),
    CONSTRAINT ck_movimiento_compensacion_origen CHECK (
        (tipo = 'COMPENSACION' AND movimiento_compensado_id IS NOT NULL AND tipo_origen = 'MOVIMIENTO_COMPENSADO')
        OR (tipo <> 'COMPENSACION' AND movimiento_compensado_id IS NULL AND tipo_origen <> 'MOVIMIENTO_COMPENSADO')
    )
);
CREATE INDEX ix_movimiento_inventario_fecha ON movimiento_inventario (inventario_sucursal_id, fecha_hora DESC);
CREATE INDEX ix_movimiento_origen ON movimiento_inventario (tipo_origen, id_origen);

CREATE FUNCTION impedir_cambio_movimiento_inventario() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'MovimientoInventario es append-only; registre una compensación.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_movimiento_inventario_inmutable
    BEFORE UPDATE OR DELETE ON movimiento_inventario
    FOR EACH ROW EXECUTE FUNCTION impedir_cambio_movimiento_inventario();

CREATE TABLE mesa (
    id UUID PRIMARY KEY,
    sucursal_id UUID NOT NULL REFERENCES sucursal(id) ON DELETE RESTRICT,
    identificador VARCHAR(40) NOT NULL,
    identificador_qr VARCHAR(120) NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_mesa_sucursal_identificador UNIQUE (sucursal_id, identificador),
    CONSTRAINT uq_mesa_sucursal_qr UNIQUE (sucursal_id, identificador_qr)
);

CREATE TABLE sesion_mesa (
    id UUID PRIMARY KEY,
    mesa_id UUID NOT NULL REFERENCES mesa(id) ON DELETE RESTRICT,
    token_seguro VARCHAR(128) NOT NULL UNIQUE,
    fecha_apertura TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMPTZ,
    estado VARCHAR(16) NOT NULL CHECK (estado IN ('ACTIVA','CERRADA','EXPIRADA')),
    abierta_por UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    cerrada_por UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT ck_sesion_mesa_cierre CHECK (
        (estado = 'ACTIVA' AND fecha_cierre IS NULL AND cerrada_por IS NULL)
        OR (estado IN ('CERRADA','EXPIRADA') AND fecha_cierre IS NOT NULL)
    )
);
CREATE UNIQUE INDEX uq_sesion_activa_por_mesa ON sesion_mesa (mesa_id) WHERE estado = 'ACTIVA';

CREATE TABLE cuenta_mesa (
    id UUID PRIMARY KEY,
    sesion_mesa_id UUID NOT NULL UNIQUE REFERENCES sesion_mesa(id) ON DELETE RESTRICT,
    fecha_apertura TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMPTZ,
    estado VARCHAR(16) NOT NULL CHECK (estado IN ('ABIERTA','CERRADA')),
    CONSTRAINT ck_cuenta_mesa_cierre CHECK (
        (estado = 'ABIERTA' AND fecha_cierre IS NULL)
        OR (estado = 'CERRADA' AND fecha_cierre IS NOT NULL)
    )
);

CREATE TABLE pedido (
    id UUID PRIMARY KEY,
    codigo_seguimiento VARCHAR(32) NOT NULL UNIQUE,
    tipo VARCHAR(16) NOT NULL CHECK (tipo IN ('EXTERNO','MESA')),
    canal_origen VARCHAR(16) NOT NULL CHECK (canal_origen IN ('WEB','WHATSAPP','QR')),
    modalidad_entrega VARCHAR(16),
    estado VARCHAR(32) NOT NULL CHECK (estado IN ('PENDIENTE_CONFIRMACION','ACEPTADO','EN_PREPARACION','LISTO','COMPLETADO','RECHAZADO','CANCELACION_SOLICITADA','CANCELADO','VENCIDO')),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento TIMESTAMPTZ,
    total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    costo_domicilio_historico NUMERIC(12,2) CHECK (costo_domicilio_historico IS NULL OR costo_domicilio_historico >= 0),
    sucursal_id UUID REFERENCES sucursal(id) ON DELETE RESTRICT,
    cuenta_mesa_id UUID REFERENCES cuenta_mesa(id) ON DELETE RESTRICT,
    nombre_cliente VARCHAR(160),
    telefono_cliente VARCHAR(30),
    direccion_entrega VARCHAR(240),
    barrio VARCHAR(120),
    referencia_direccion VARCHAR(240),
    ubicacion_consentida BOOLEAN NOT NULL DEFAULT FALSE,
    latitud_entrega NUMERIC(9,6),
    longitud_entrega NUMERIC(9,6),
    nombre_destinatario VARCHAR(160),
    telefono_destinatario VARCHAR(30),
    CONSTRAINT ck_pedido_origen_modalidad CHECK (
        (tipo = 'MESA' AND canal_origen = 'QR' AND cuenta_mesa_id IS NOT NULL AND modalidad_entrega = 'MESA' AND sucursal_id IS NOT NULL)
        OR (tipo = 'EXTERNO' AND canal_origen IN ('WEB','WHATSAPP') AND cuenta_mesa_id IS NULL AND modalidad_entrega IN ('RECOGER','DOMICILIO'))
    ),
    CONSTRAINT ck_pedido_recogida_sucursal CHECK (
        modalidad_entrega <> 'RECOGER' OR sucursal_id IS NOT NULL
    ),
    CONSTRAINT ck_pedido_sucursal_aceptado CHECK (
        estado IN ('PENDIENTE_CONFIRMACION','VENCIDO','RECHAZADO','CANCELADO','CANCELACION_SOLICITADA')
        OR sucursal_id IS NOT NULL
    ),
    CONSTRAINT ck_pedido_domicilio_datos CHECK (
        modalidad_entrega <> 'DOMICILIO'
        OR (costo_domicilio_historico IS NOT NULL AND (
            (ubicacion_consentida AND latitud_entrega IS NOT NULL AND longitud_entrega IS NOT NULL
                AND latitud_entrega BETWEEN -90 AND 90 AND longitud_entrega BETWEEN -180 AND 180)
            OR (NOT ubicacion_consentida AND direccion_entrega IS NOT NULL AND barrio IS NOT NULL
                AND latitud_entrega IS NULL AND longitud_entrega IS NULL)
        ))
    ),
    CONSTRAINT ck_pedido_ubicacion_consentida CHECK (
        (ubicacion_consentida AND modalidad_entrega = 'DOMICILIO'
            AND latitud_entrega IS NOT NULL AND longitud_entrega IS NOT NULL
            AND latitud_entrega BETWEEN -90 AND 90 AND longitud_entrega BETWEEN -180 AND 180)
        OR (NOT ubicacion_consentida AND latitud_entrega IS NULL AND longitud_entrega IS NULL)
    )
);
CREATE INDEX ix_pedido_estado_llegada ON pedido (estado, fecha_creacion);
CREATE INDEX ix_pedido_sucursal_fecha ON pedido (sucursal_id, fecha_creacion DESC);
CREATE INDEX ix_pedido_cuenta_fecha ON pedido (cuenta_mesa_id, fecha_creacion);

CREATE TABLE detalle_pedido (
    id UUID PRIMARY KEY,
    pedido_id UUID NOT NULL REFERENCES pedido(id) ON DELETE RESTRICT,
    producto_id UUID NOT NULL REFERENCES producto(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario_historico NUMERIC(12,2) NOT NULL CHECK (precio_unitario_historico >= 0),
    nombre_producto_historico VARCHAR(120) NOT NULL
);
CREATE INDEX ix_detalle_pedido_pedido ON detalle_pedido (pedido_id);

CREATE TABLE pago (
    id UUID PRIMARY KEY,
    pedido_id UUID REFERENCES pedido(id) ON DELETE RESTRICT,
    cuenta_mesa_id UUID REFERENCES cuenta_mesa(id) ON DELETE RESTRICT,
    metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('EFECTIVO','TRANSFERENCIA')),
    estado VARCHAR(24) NOT NULL CHECK (estado IN ('PENDIENTE','PENDIENTE_VERIFICACION','CONFIRMADO','RECHAZADO','REEMBOLSADO')),
    importe NUMERIC(12,2) NOT NULL CHECK (importe > 0),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_confirmacion TIMESTAMPTZ,
    archivo VARCHAR(500),
    fecha_carga TIMESTAMPTZ,
    verificado_por UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    fecha_verificacion TIMESTAMPTZ,
    motivo_rechazo VARCHAR(500),
    reembolso_fecha TIMESTAMPTZ,
    reembolso_motivo VARCHAR(500),
    reembolso_por UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    reembolso_estado VARCHAR(20),
    CONSTRAINT ck_pago_origen_xor CHECK ((pedido_id IS NOT NULL) <> (cuenta_mesa_id IS NOT NULL)),
    CONSTRAINT ck_pago_comprobante CHECK ((archivo IS NULL AND fecha_carga IS NULL) OR (archivo IS NOT NULL AND fecha_carga IS NOT NULL)),
    CONSTRAINT ck_pago_verificacion CHECK ((verificado_por IS NULL AND fecha_verificacion IS NULL) OR (verificado_por IS NOT NULL AND fecha_verificacion IS NOT NULL)),
    CONSTRAINT ck_pago_rechazo CHECK (estado <> 'RECHAZADO' OR (motivo_rechazo IS NOT NULL AND LENGTH(BTRIM(motivo_rechazo)) > 0)),
    CONSTRAINT ck_pago_reembolso CHECK (
        (reembolso_fecha IS NULL AND reembolso_motivo IS NULL AND reembolso_por IS NULL AND reembolso_estado IS NULL)
        OR (reembolso_fecha IS NOT NULL AND reembolso_motivo IS NOT NULL AND reembolso_por IS NOT NULL AND reembolso_estado IS NOT NULL)
    )
);
CREATE INDEX ix_pago_pedido ON pago (pedido_id, fecha_creacion DESC);
CREATE INDEX ix_pago_cuenta ON pago (cuenta_mesa_id, fecha_creacion DESC);

CREATE TABLE entrega (
    id UUID PRIMARY KEY,
    pedido_id UUID NOT NULL UNIQUE REFERENCES pedido(id) ON DELETE RESTRICT,
    repartidor_id UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    estado VARCHAR(24) NOT NULL CHECK (estado IN ('PENDIENTE_ASIGNACION','ASIGNADA','RECOGIDA','EN_CAMINO','ENTREGADA','NO_ENTREGADA')),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_recogida TIMESTAMPTZ,
    fecha_salida TIMESTAMPTZ,
    fecha_entrega TIMESTAMPTZ,
    observaciones TEXT,
    monto_efectivo_declarado NUMERIC(12,2) CHECK (monto_efectivo_declarado IS NULL OR monto_efectivo_declarado >= 0)
);
CREATE INDEX ix_entrega_estado_fecha ON entrega (estado, fecha_creacion);
CREATE INDEX ix_entrega_repartidor_fecha ON entrega (repartidor_id, fecha_creacion DESC);

CREATE TABLE conciliacion_efectivo (
    id UUID PRIMARY KEY,
    entrega_id UUID NOT NULL UNIQUE REFERENCES entrega(id) ON DELETE RESTRICT,
    monto_declarado NUMERIC(12,2) NOT NULL CHECK (monto_declarado >= 0),
    monto_recibido NUMERIC(12,2) NOT NULL CHECK (monto_recibido >= 0),
    fecha_conciliacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo_diferencia VARCHAR(500),
    declarado_por UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    recibido_por UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT ck_conciliacion_motivo CHECK (
        monto_declarado = monto_recibido
        OR (motivo_diferencia IS NOT NULL AND LENGTH(BTRIM(motivo_diferencia)) > 0)
    )
);

CREATE TABLE configuracion_domicilio (
    id UUID PRIMARY KEY,
    tarifa NUMERIC(12,2) NOT NULL CHECK (tarifa >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uq_configuracion_domicilio_activa ON configuracion_domicilio (activo) WHERE activo;

CREATE TABLE solicitud_reposicion (
    id UUID PRIMARY KEY,
    sucursal_solicitante_id UUID NOT NULL REFERENCES sucursal(id) ON DELETE RESTRICT,
    sucursal_proveedora_id UUID NOT NULL REFERENCES sucursal(id) ON DELETE RESTRICT,
    solicitada_por UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    revisada_por UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    estado VARCHAR(24) NOT NULL CHECK (estado IN ('PENDIENTE_REVISION','RECHAZADA','EN_PROCESO','COMPLETADA')),
    fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMPTZ,
    observaciones TEXT,
    motivo_rechazo VARCHAR(500),
    CONSTRAINT ck_reposicion_sucursales_distintas CHECK (sucursal_solicitante_id <> sucursal_proveedora_id),
    CONSTRAINT ck_reposicion_revision CHECK (
        (estado = 'PENDIENTE_REVISION' AND fecha_revision IS NULL)
        OR (estado <> 'PENDIENTE_REVISION' AND fecha_revision IS NOT NULL AND revisada_por IS NOT NULL)
    ),
    CONSTRAINT ck_reposicion_motivo_rechazo CHECK (estado <> 'RECHAZADA' OR (motivo_rechazo IS NOT NULL AND LENGTH(BTRIM(motivo_rechazo)) > 0))
);
CREATE INDEX ix_reposicion_estado_fecha ON solicitud_reposicion (estado, fecha_solicitud);

CREATE TABLE detalle_solicitud_reposicion (
    id UUID PRIMARY KEY,
    solicitud_id UUID NOT NULL REFERENCES solicitud_reposicion(id) ON DELETE RESTRICT,
    producto_id UUID NOT NULL REFERENCES producto(id) ON DELETE RESTRICT,
    cantidad_solicitada INTEGER NOT NULL CHECK (cantidad_solicitada > 0),
    cantidad_aprobada INTEGER CHECK (cantidad_aprobada IS NULL OR (cantidad_aprobada > 0 AND cantidad_aprobada <= cantidad_solicitada)),
    cantidad_faltante_cerrada INTEGER CHECK (cantidad_faltante_cerrada IS NULL OR cantidad_faltante_cerrada >= 0),
    motivo_cierre VARCHAR(500),
    fecha_cierre TIMESTAMPTZ,
    cerrado_por UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    fecha_reversa TIMESTAMPTZ,
    revertido_por UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    motivo_reversa VARCHAR(500),
    CONSTRAINT uq_detalle_solicitud_producto UNIQUE (solicitud_id, producto_id),
    CONSTRAINT ck_detalle_solicitud_cierre CHECK (
        (cantidad_faltante_cerrada IS NULL AND motivo_cierre IS NULL AND fecha_cierre IS NULL AND cerrado_por IS NULL)
        OR (cantidad_faltante_cerrada IS NOT NULL AND motivo_cierre IS NOT NULL AND fecha_cierre IS NOT NULL AND cerrado_por IS NOT NULL)
    ),
    CONSTRAINT ck_detalle_solicitud_reversa CHECK (
        (fecha_reversa IS NULL AND revertido_por IS NULL AND motivo_reversa IS NULL)
        OR (fecha_reversa IS NOT NULL AND revertido_por IS NOT NULL AND motivo_reversa IS NOT NULL AND cantidad_faltante_cerrada IS NOT NULL)
    )
);

CREATE TABLE despacho_reposicion (
    id UUID PRIMARY KEY,
    solicitud_id UUID NOT NULL REFERENCES solicitud_reposicion(id) ON DELETE RESTRICT,
    despachado_por UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    fecha_despacho TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    anulado_en TIMESTAMPTZ,
    anulado_por UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    motivo_anulacion VARCHAR(500),
    CONSTRAINT ck_despacho_anulacion CHECK (
        (anulado_en IS NULL AND anulado_por IS NULL AND motivo_anulacion IS NULL)
        OR (anulado_en IS NOT NULL AND anulado_por IS NOT NULL AND motivo_anulacion IS NOT NULL)
    )
);

CREATE TABLE detalle_despacho_reposicion (
    id UUID PRIMARY KEY,
    despacho_id UUID NOT NULL REFERENCES despacho_reposicion(id) ON DELETE RESTRICT,
    detalle_solicitud_id UUID NOT NULL REFERENCES detalle_solicitud_reposicion(id) ON DELETE RESTRICT,
    cantidad_enviada INTEGER NOT NULL CHECK (cantidad_enviada > 0),
    cantidad_faltante_cerrada INTEGER CHECK (cantidad_faltante_cerrada IS NULL OR cantidad_faltante_cerrada >= 0),
    motivo_cierre VARCHAR(500),
    fecha_cierre TIMESTAMPTZ,
    cerrado_por UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    fecha_reversa TIMESTAMPTZ,
    revertido_por UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    motivo_reversa VARCHAR(500),
    CONSTRAINT uq_detalle_despacho_linea UNIQUE (despacho_id, detalle_solicitud_id),
    CONSTRAINT ck_detalle_despacho_cierre CHECK (
        (cantidad_faltante_cerrada IS NULL AND motivo_cierre IS NULL AND fecha_cierre IS NULL AND cerrado_por IS NULL)
        OR (cantidad_faltante_cerrada IS NOT NULL AND motivo_cierre IS NOT NULL AND fecha_cierre IS NOT NULL AND cerrado_por IS NOT NULL)
    ),
    CONSTRAINT ck_detalle_despacho_reversa CHECK (
        (fecha_reversa IS NULL AND revertido_por IS NULL AND motivo_reversa IS NULL)
        OR (fecha_reversa IS NOT NULL AND revertido_por IS NOT NULL AND motivo_reversa IS NOT NULL AND cantidad_faltante_cerrada IS NOT NULL)
    )
);

CREATE TABLE recepcion_reposicion (
    id UUID PRIMARY KEY,
    despacho_id UUID NOT NULL REFERENCES despacho_reposicion(id) ON DELETE RESTRICT,
    responsable_id UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    fecha_recepcion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    anulado_en TIMESTAMPTZ,
    anulado_por UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    motivo_anulacion VARCHAR(500),
    CONSTRAINT ck_recepcion_anulacion CHECK (
        (anulado_en IS NULL AND anulado_por IS NULL AND motivo_anulacion IS NULL)
        OR (anulado_en IS NOT NULL AND anulado_por IS NOT NULL AND motivo_anulacion IS NOT NULL)
    )
);

CREATE TABLE detalle_recepcion_reposicion (
    id UUID PRIMARY KEY,
    recepcion_id UUID NOT NULL REFERENCES recepcion_reposicion(id) ON DELETE RESTRICT,
    detalle_despacho_id UUID NOT NULL REFERENCES detalle_despacho_reposicion(id) ON DELETE RESTRICT,
    cantidad_apta INTEGER NOT NULL CHECK (cantidad_apta >= 0),
    cantidad_danada INTEGER NOT NULL CHECK (cantidad_danada >= 0),
    CONSTRAINT uq_detalle_recepcion_linea UNIQUE (recepcion_id, detalle_despacho_id),
    CONSTRAINT ck_detalle_recepcion_cantidad CHECK (cantidad_apta + cantidad_danada > 0)
);

CREATE TABLE horario_sucursal (
    id UUID PRIMARY KEY,
    sucursal_id UUID NOT NULL REFERENCES sucursal(id) ON DELETE RESTRICT,
    dia_semana VARCHAR(12) NOT NULL CHECK (dia_semana IN ('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO')),
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_horario_sucursal_dia UNIQUE (sucursal_id, dia_semana),
    CONSTRAINT ck_horario_intervalo CHECK (hora_cierre > hora_apertura OR NOT activo)
);

CREATE TABLE registro_auditoria (
    id UUID PRIMARY KEY,
    fecha_hora TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operacion VARCHAR(80) NOT NULL,
    entidad VARCHAR(80) NOT NULL,
    entidad_id UUID,
    valor_anterior JSONB,
    valor_nuevo JSONB,
    descripcion VARCHAR(1000),
    tipo_actor VARCHAR(12) NOT NULL CHECK (tipo_actor IN ('USUARIO','SISTEMA')),
    usuario_id UUID REFERENCES usuario(id) ON DELETE RESTRICT,
    CONSTRAINT ck_auditoria_actor CHECK (tipo_actor <> 'SISTEMA' OR usuario_id IS NULL)
);
CREATE INDEX ix_auditoria_fecha ON registro_auditoria (fecha_hora DESC);
CREATE INDEX ix_auditoria_entidad ON registro_auditoria (entidad, entidad_id);

