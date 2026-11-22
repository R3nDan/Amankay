package com.amankay.backend.modules.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

/** Persisted domain row for the approved Amankay MER. */
@Entity
@Table(name = "entrega")
public class Entrega extends BaseEntity {

    @Column(name = "pedido_id", nullable = false)
    private UUID pedidoId;

    @Column(name = "repartidor_id", nullable = true)
    private UUID repartidorId;

    @Column(name = "estado", nullable = false, length = 24)
    private String estado;

    @Column(name = "fecha_creacion", nullable = false)
    private Instant fechaCreacion;

    @Column(name = "fecha_recogida", nullable = true)
    private Instant fechaRecogida;

    @Column(name = "fecha_salida", nullable = true)
    private Instant fechaSalida;

    @Column(name = "fecha_entrega", nullable = true)
    private Instant fechaEntrega;

    @Column(name = "observaciones", nullable = true, length = 4000)
    private String observaciones;

    @Column(name = "monto_efectivo_declarado", nullable = true, precision = 12, scale = 2)
    private BigDecimal montoEfectivoDeclarado;

    public Entrega() {}

    public UUID getPedidoId() { return pedidoId; }
    public void setPedidoId(UUID pedidoId) { this.pedidoId = pedidoId; }

    public UUID getRepartidorId() { return repartidorId; }
    public void setRepartidorId(UUID repartidorId) { this.repartidorId = repartidorId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Instant getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Instant fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Instant getFechaRecogida() { return fechaRecogida; }
    public void setFechaRecogida(Instant fechaRecogida) { this.fechaRecogida = fechaRecogida; }

    public Instant getFechaSalida() { return fechaSalida; }
    public void setFechaSalida(Instant fechaSalida) { this.fechaSalida = fechaSalida; }

    public Instant getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(Instant fechaEntrega) { this.fechaEntrega = fechaEntrega; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public BigDecimal getMontoEfectivoDeclarado() { return montoEfectivoDeclarado; }
    public void setMontoEfectivoDeclarado(BigDecimal montoEfectivoDeclarado) { this.montoEfectivoDeclarado = montoEfectivoDeclarado; }
}

