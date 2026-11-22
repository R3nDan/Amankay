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
@Table(name = "solicitud_reposicion")
public class SolicitudReposicion extends BaseEntity {

    @Column(name = "sucursal_solicitante_id", nullable = false)
    private UUID sucursalSolicitanteId;

    @Column(name = "sucursal_proveedora_id", nullable = false)
    private UUID sucursalProveedoraId;

    @Column(name = "solicitada_por", nullable = false)
    private UUID solicitadaPor;

    @Column(name = "revisada_por", nullable = true)
    private UUID revisadaPor;

    @Column(name = "estado", nullable = false, length = 24)
    private String estado;

    @Column(name = "fecha_solicitud", nullable = false)
    private Instant fechaSolicitud;

    @Column(name = "fecha_revision", nullable = true)
    private Instant fechaRevision;

    @Column(name = "observaciones", nullable = true, length = 4000)
    private String observaciones;

    @Column(name = "motivo_rechazo", nullable = true, length = 500)
    private String motivoRechazo;

    public SolicitudReposicion() {}

    public UUID getSucursalSolicitanteId() { return sucursalSolicitanteId; }
    public void setSucursalSolicitanteId(UUID sucursalSolicitanteId) { this.sucursalSolicitanteId = sucursalSolicitanteId; }

    public UUID getSucursalProveedoraId() { return sucursalProveedoraId; }
    public void setSucursalProveedoraId(UUID sucursalProveedoraId) { this.sucursalProveedoraId = sucursalProveedoraId; }

    public UUID getSolicitadaPor() { return solicitadaPor; }
    public void setSolicitadaPor(UUID solicitadaPor) { this.solicitadaPor = solicitadaPor; }

    public UUID getRevisadaPor() { return revisadaPor; }
    public void setRevisadaPor(UUID revisadaPor) { this.revisadaPor = revisadaPor; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Instant getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(Instant fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }

    public Instant getFechaRevision() { return fechaRevision; }
    public void setFechaRevision(Instant fechaRevision) { this.fechaRevision = fechaRevision; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }
}

