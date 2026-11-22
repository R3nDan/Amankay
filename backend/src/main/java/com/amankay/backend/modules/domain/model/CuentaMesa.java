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
@Table(name = "cuenta_mesa")
public class CuentaMesa extends BaseEntity {

    @Column(name = "sesion_mesa_id", nullable = false)
    private UUID sesionMesaId;

    @Column(name = "fecha_apertura", nullable = false)
    private Instant fechaApertura;

    @Column(name = "fecha_cierre", nullable = true)
    private Instant fechaCierre;

    @Column(name = "estado", nullable = false, length = 16)
    private String estado;

    public CuentaMesa() {}

    public UUID getSesionMesaId() { return sesionMesaId; }
    public void setSesionMesaId(UUID sesionMesaId) { this.sesionMesaId = sesionMesaId; }

    public Instant getFechaApertura() { return fechaApertura; }
    public void setFechaApertura(Instant fechaApertura) { this.fechaApertura = fechaApertura; }

    public Instant getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(Instant fechaCierre) { this.fechaCierre = fechaCierre; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}

