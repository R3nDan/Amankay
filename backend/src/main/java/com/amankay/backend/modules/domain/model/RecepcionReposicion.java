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
@Table(name = "recepcion_reposicion")
public class RecepcionReposicion extends BaseEntity {

    @Column(name = "despacho_id", nullable = false)
    private UUID despachoId;

    @Column(name = "responsable_id", nullable = false)
    private UUID responsableId;

    @Column(name = "fecha_recepcion", nullable = false)
    private Instant fechaRecepcion;

    @Column(name = "observaciones", nullable = true, length = 4000)
    private String observaciones;

    @Column(name = "anulado_en", nullable = true)
    private Instant anuladoEn;

    @Column(name = "anulado_por", nullable = true)
    private UUID anuladoPor;

    @Column(name = "motivo_anulacion", nullable = true, length = 500)
    private String motivoAnulacion;

    public RecepcionReposicion() {}

    public UUID getDespachoId() { return despachoId; }
    public void setDespachoId(UUID despachoId) { this.despachoId = despachoId; }

    public UUID getResponsableId() { return responsableId; }
    public void setResponsableId(UUID responsableId) { this.responsableId = responsableId; }

    public Instant getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(Instant fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public Instant getAnuladoEn() { return anuladoEn; }
    public void setAnuladoEn(Instant anuladoEn) { this.anuladoEn = anuladoEn; }

    public UUID getAnuladoPor() { return anuladoPor; }
    public void setAnuladoPor(UUID anuladoPor) { this.anuladoPor = anuladoPor; }

    public String getMotivoAnulacion() { return motivoAnulacion; }
    public void setMotivoAnulacion(String motivoAnulacion) { this.motivoAnulacion = motivoAnulacion; }
}

