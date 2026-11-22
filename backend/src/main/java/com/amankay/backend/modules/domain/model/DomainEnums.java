package com.amankay.backend.modules.domain.model;

public final class DomainEnums {
    private DomainEnums() {}
    public enum RoleName { ADMINISTRADOR, ATENCION, INVENTARIO, REPARTIDOR }
    public enum BranchType { PRINCIPAL, SECUNDARIA }
    public enum OrderType { EXTERNO, MESA }
    public enum OrderChannel { WEB, WHATSAPP, QR }
    public enum DeliveryMode { RECOGER, DOMICILIO, MESA }
    public enum OrderStatus { PENDIENTE_CONFIRMACION, ACEPTADO, EN_PREPARACION, LISTO, COMPLETADO, RECHAZADO, CANCELACION_SOLICITADA, CANCELADO, VENCIDO }
    public enum PaymentMethod { EFECTIVO, TRANSFERENCIA }
    public enum PaymentStatus { PENDIENTE, PENDIENTE_VERIFICACION, CONFIRMADO, RECHAZADO, REEMBOLSADO }
    public enum SessionStatus { ACTIVA, CERRADA, EXPIRADA }
    public enum AccountStatus { ABIERTA, CERRADA }
    public enum DeliveryStatus { PENDIENTE_ASIGNACION, ASIGNADA, RECOGIDA, EN_CAMINO, ENTREGADA, NO_ENTREGADA }
    public enum ReplenishmentStatus { PENDIENTE_REVISION, RECHAZADA, EN_PROCESO, COMPLETADA }
    public enum MovementType { ENTRADA_INICIAL, AJUSTE_POSITIVO, AJUSTE_NEGATIVO, MERMA, VENTA, DESPACHO_REPOSICION, RECEPCION_REPOSICION, COMPENSACION }
    public enum MovementOrigin { DETALLE_PEDIDO, DETALLE_DESPACHO_REPOSICION, DETALLE_RECEPCION_REPOSICION, REGISTRO_AUDITORIA, MOVIMIENTO_COMPENSADO }
    public enum DayOfWeekName { LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO }
    public enum AuditActor { USUARIO, SISTEMA }
}

