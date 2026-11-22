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
@Table(name = "conciliacion_efectivo")
public class ConciliacionEfectivo extends BaseEntity {

    @Column(name = "entrega_id", nullable = false)
    private UUID entregaId;

    @Column(name = "monto_declarado", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoDeclarado;

    @Column(name = "monto_recibido", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoRecibido;

    @Column(name = "fecha_conciliacion", nullable = false)
    private Instant fechaConciliacion;

    @Column(name = "motivo_diferencia", nullable = true, length = 500)
    private String motivoDiferencia;

    @Column(name = "declarado_por", nullable = false)
    private UUID declaradoPor;

    @Column(name = "recibido_por", nullable = false)
    private UUID recibidoPor;

    public ConciliacionEfectivo() {}

    public UUID getEntregaId() { return entregaId; }
    public void setEntregaId(UUID entregaId) { this.entregaId = entregaId; }

    public BigDecimal getMontoDeclarado() { return montoDeclarado; }
    public void setMontoDeclarado(BigDecimal montoDeclarado) { this.montoDeclarado = montoDeclarado; }

    public BigDecimal getMontoRecibido() { return montoRecibido; }
    public void setMontoRecibido(BigDecimal montoRecibido) { this.montoRecibido = montoRecibido; }

    public Instant getFechaConciliacion() { return fechaConciliacion; }
    public void setFechaConciliacion(Instant fechaConciliacion) { this.fechaConciliacion = fechaConciliacion; }

    public String getMotivoDiferencia() { return motivoDiferencia; }
    public void setMotivoDiferencia(String motivoDiferencia) { this.motivoDiferencia = motivoDiferencia; }

    public UUID getDeclaradoPor() { return declaradoPor; }
    public void setDeclaradoPor(UUID declaradoPor) { this.declaradoPor = declaradoPor; }

    public UUID getRecibidoPor() { return recibidoPor; }
    public void setRecibidoPor(UUID recibidoPor) { this.recibidoPor = recibidoPor; }
}

