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
@Table(name = "detalle_despacho_reposicion")
public class DetalleDespachoReposicion extends BaseEntity {

    @Column(name = "despacho_id", nullable = false)
    private UUID despachoId;

    @Column(name = "detalle_solicitud_id", nullable = false)
    private UUID detalleSolicitudId;

    @Column(name = "cantidad_enviada", nullable = false)
    private Integer cantidadEnviada;

    @Column(name = "cantidad_faltante_cerrada", nullable = true)
    private Integer cantidadFaltanteCerrada;

    @Column(name = "motivo_cierre", nullable = true, length = 500)
    private String motivoCierre;

    @Column(name = "fecha_cierre", nullable = true)
    private Instant fechaCierre;

    @Column(name = "cerrado_por", nullable = true)
    private UUID cerradoPor;

    @Column(name = "fecha_reversa", nullable = true)
    private Instant fechaReversa;

    @Column(name = "revertido_por", nullable = true)
    private UUID revertidoPor;

    @Column(name = "motivo_reversa", nullable = true, length = 500)
    private String motivoReversa;

    public DetalleDespachoReposicion() {}

    public UUID getDespachoId() { return despachoId; }
    public void setDespachoId(UUID despachoId) { this.despachoId = despachoId; }

    public UUID getDetalleSolicitudId() { return detalleSolicitudId; }
    public void setDetalleSolicitudId(UUID detalleSolicitudId) { this.detalleSolicitudId = detalleSolicitudId; }

    public Integer getCantidadEnviada() { return cantidadEnviada; }
    public void setCantidadEnviada(Integer cantidadEnviada) { this.cantidadEnviada = cantidadEnviada; }

    public Integer getCantidadFaltanteCerrada() { return cantidadFaltanteCerrada; }
    public void setCantidadFaltanteCerrada(Integer cantidadFaltanteCerrada) { this.cantidadFaltanteCerrada = cantidadFaltanteCerrada; }

    public String getMotivoCierre() { return motivoCierre; }
    public void setMotivoCierre(String motivoCierre) { this.motivoCierre = motivoCierre; }

    public Instant getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(Instant fechaCierre) { this.fechaCierre = fechaCierre; }

    public UUID getCerradoPor() { return cerradoPor; }
    public void setCerradoPor(UUID cerradoPor) { this.cerradoPor = cerradoPor; }

    public Instant getFechaReversa() { return fechaReversa; }
    public void setFechaReversa(Instant fechaReversa) { this.fechaReversa = fechaReversa; }

    public UUID getRevertidoPor() { return revertidoPor; }
    public void setRevertidoPor(UUID revertidoPor) { this.revertidoPor = revertidoPor; }

    public String getMotivoReversa() { return motivoReversa; }
    public void setMotivoReversa(String motivoReversa) { this.motivoReversa = motivoReversa; }
}

