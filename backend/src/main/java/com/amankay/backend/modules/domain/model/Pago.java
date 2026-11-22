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
@Table(name = "pago")
public class Pago extends BaseEntity {

    @Column(name = "pedido_id", nullable = true)
    private UUID pedidoId;

    @Column(name = "cuenta_mesa_id", nullable = true)
    private UUID cuentaMesaId;

    @Column(name = "metodo", nullable = false, length = 20)
    private String metodo;

    @Column(name = "estado", nullable = false, length = 24)
    private String estado;

    @Column(name = "importe", nullable = false, precision = 12, scale = 2)
    private BigDecimal importe;

    @Column(name = "fecha_creacion", nullable = false)
    private Instant fechaCreacion;

    @Column(name = "fecha_confirmacion", nullable = true)
    private Instant fechaConfirmacion;

    @Column(name = "archivo", nullable = true, length = 500)
    private String archivo;

    @Column(name = "fecha_carga", nullable = true)
    private Instant fechaCarga;

    @Column(name = "verificado_por", nullable = true)
    private UUID verificadoPor;

    @Column(name = "fecha_verificacion", nullable = true)
    private Instant fechaVerificacion;

    @Column(name = "motivo_rechazo", nullable = true, length = 500)
    private String motivoRechazo;

    @Column(name = "reembolso_fecha", nullable = true)
    private Instant reembolsoFecha;

    @Column(name = "reembolso_motivo", nullable = true, length = 500)
    private String reembolsoMotivo;

    @Column(name = "reembolso_por", nullable = true)
    private UUID reembolsoPor;

    @Column(name = "reembolso_estado", nullable = true, length = 20)
    private String reembolsoEstado;

    public Pago() {}

    public UUID getPedidoId() { return pedidoId; }
    public void setPedidoId(UUID pedidoId) { this.pedidoId = pedidoId; }

    public UUID getCuentaMesaId() { return cuentaMesaId; }
    public void setCuentaMesaId(UUID cuentaMesaId) { this.cuentaMesaId = cuentaMesaId; }

    public String getMetodo() { return metodo; }
    public void setMetodo(String metodo) { this.metodo = metodo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public BigDecimal getImporte() { return importe; }
    public void setImporte(BigDecimal importe) { this.importe = importe; }

    public Instant getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Instant fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Instant getFechaConfirmacion() { return fechaConfirmacion; }
    public void setFechaConfirmacion(Instant fechaConfirmacion) { this.fechaConfirmacion = fechaConfirmacion; }

    public String getArchivo() { return archivo; }
    public void setArchivo(String archivo) { this.archivo = archivo; }

    public Instant getFechaCarga() { return fechaCarga; }
    public void setFechaCarga(Instant fechaCarga) { this.fechaCarga = fechaCarga; }

    public UUID getVerificadoPor() { return verificadoPor; }
    public void setVerificadoPor(UUID verificadoPor) { this.verificadoPor = verificadoPor; }

    public Instant getFechaVerificacion() { return fechaVerificacion; }
    public void setFechaVerificacion(Instant fechaVerificacion) { this.fechaVerificacion = fechaVerificacion; }

    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }

    public Instant getReembolsoFecha() { return reembolsoFecha; }
    public void setReembolsoFecha(Instant reembolsoFecha) { this.reembolsoFecha = reembolsoFecha; }

    public String getReembolsoMotivo() { return reembolsoMotivo; }
    public void setReembolsoMotivo(String reembolsoMotivo) { this.reembolsoMotivo = reembolsoMotivo; }

    public UUID getReembolsoPor() { return reembolsoPor; }
    public void setReembolsoPor(UUID reembolsoPor) { this.reembolsoPor = reembolsoPor; }

    public String getReembolsoEstado() { return reembolsoEstado; }
    public void setReembolsoEstado(String reembolsoEstado) { this.reembolsoEstado = reembolsoEstado; }
}

