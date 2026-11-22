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
@Table(name = "configuracion_domicilio")
public class ConfiguracionDomicilio extends BaseEntity {

    @Column(name = "tarifa", nullable = false, precision = 12, scale = 2)
    private BigDecimal tarifa;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "fecha_actualizacion", nullable = false)
    private Instant fechaActualizacion;

    public ConfiguracionDomicilio() {}

    public BigDecimal getTarifa() { return tarifa; }
    public void setTarifa(BigDecimal tarifa) { this.tarifa = tarifa; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public Instant getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(Instant fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}

