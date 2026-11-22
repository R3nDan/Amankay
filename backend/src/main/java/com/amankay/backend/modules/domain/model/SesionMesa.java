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
@Table(name = "sesion_mesa")
public class SesionMesa extends BaseEntity {

    @Column(name = "mesa_id", nullable = false)
    private UUID mesaId;

    @Column(name = "token_seguro", nullable = false, length = 128)
    private String tokenSeguro;

    @Column(name = "fecha_apertura", nullable = false)
    private Instant fechaApertura;

    @Column(name = "fecha_cierre", nullable = true)
    private Instant fechaCierre;

    @Column(name = "estado", nullable = false, length = 16)
    private String estado;

    @Column(name = "abierta_por", nullable = false)
    private UUID abiertaPor;

    @Column(name = "cerrada_por", nullable = true)
    private UUID cerradaPor;

    public SesionMesa() {}

    public UUID getMesaId() { return mesaId; }
    public void setMesaId(UUID mesaId) { this.mesaId = mesaId; }

    public String getTokenSeguro() { return tokenSeguro; }
    public void setTokenSeguro(String tokenSeguro) { this.tokenSeguro = tokenSeguro; }

    public Instant getFechaApertura() { return fechaApertura; }
    public void setFechaApertura(Instant fechaApertura) { this.fechaApertura = fechaApertura; }

    public Instant getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(Instant fechaCierre) { this.fechaCierre = fechaCierre; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public UUID getAbiertaPor() { return abiertaPor; }
    public void setAbiertaPor(UUID abiertaPor) { this.abiertaPor = abiertaPor; }

    public UUID getCerradaPor() { return cerradaPor; }
    public void setCerradaPor(UUID cerradaPor) { this.cerradaPor = cerradaPor; }
}

