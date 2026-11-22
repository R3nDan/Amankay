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
@Table(name = "despacho_reposicion")
public class DespachoReposicion extends BaseEntity {

    @Column(name = "solicitud_id", nullable = false)
    private UUID solicitudId;

    @Column(name = "despachado_por", nullable = false)
    private UUID despachadoPor;

    @Column(name = "fecha_despacho", nullable = false)
    private Instant fechaDespacho;

    @Column(name = "observaciones", nullable = true, length = 4000)
    private String observaciones;

    @Column(name = "anulado_en", nullable = true)
    private Instant anuladoEn;

    @Column(name = "anulado_por", nullable = true)
    private UUID anuladoPor;

    @Column(name = "motivo_anulacion", nullable = true, length = 500)
    private String motivoAnulacion;

    public DespachoReposicion() {}

    public UUID getSolicitudId() { return solicitudId; }
    public void setSolicitudId(UUID solicitudId) { this.solicitudId = solicitudId; }

    public UUID getDespachadoPor() { return despachadoPor; }
    public void setDespachadoPor(UUID despachadoPor) { this.despachadoPor = despachadoPor; }

    public Instant getFechaDespacho() { return fechaDespacho; }
    public void setFechaDespacho(Instant fechaDespacho) { this.fechaDespacho = fechaDespacho; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Instant getAnuladoEn() { return anuladoEn; }
    public void setAnuladoEn(Instant anuladoEn) { this.anuladoEn = anuladoEn; }

    public UUID getAnuladoPor() { return anuladoPor; }
    public void setAnuladoPor(UUID anuladoPor) { this.anuladoPor = anuladoPor; }

    public String getMotivoAnulacion() { return motivoAnulacion; }
    public void setMotivoAnulacion(String motivoAnulacion) { this.motivoAnulacion = motivoAnulacion; }
}

