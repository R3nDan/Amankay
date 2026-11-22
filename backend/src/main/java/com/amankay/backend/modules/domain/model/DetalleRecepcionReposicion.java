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
@Table(name = "detalle_recepcion_reposicion")
public class DetalleRecepcionReposicion extends BaseEntity {

    @Column(name = "recepcion_id", nullable = false)
    private UUID recepcionId;

    @Column(name = "detalle_despacho_id", nullable = false)
    private UUID detalleDespachoId;

    @Column(name = "cantidad_apta", nullable = false)
    private Integer cantidadApta;

    @Column(name = "cantidad_danada", nullable = false)
    private Integer cantidadDanada;

    public DetalleRecepcionReposicion() {}

    public UUID getRecepcionId() { return recepcionId; }
    public void setRecepcionId(UUID recepcionId) { this.recepcionId = recepcionId; }

    public UUID getDetalleDespachoId() { return detalleDespachoId; }
    public void setDetalleDespachoId(UUID detalleDespachoId) { this.detalleDespachoId = detalleDespachoId; }

    public Integer getCantidadApta() { return cantidadApta; }
    public void setCantidadApta(Integer cantidadApta) { this.cantidadApta = cantidadApta; }

    public Integer getCantidadDanada() { return cantidadDanada; }
    public void setCantidadDanada(Integer cantidadDanada) { this.cantidadDanada = cantidadDanada; }
}

