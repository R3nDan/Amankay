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
@Table(name = "pedido")
public class Pedido extends BaseEntity {

    @Column(name = "codigo_seguimiento", nullable = false, length = 32)
    private String codigoSeguimiento;

    @Column(name = "tipo", nullable = false, length = 16)
    private String tipo;

    @Column(name = "canal_origen", nullable = false, length = 16)
    private String canalOrigen;

    @Column(name = "modalidad_entrega", nullable = true, length = 16)
    private String modalidadEntrega;

    @Column(name = "estado", nullable = false, length = 32)
    private String estado;

    @Column(name = "fecha_creacion", nullable = false)
    private Instant fechaCreacion;

    @Column(name = "fecha_vencimiento", nullable = true)
    private Instant fechaVencimiento;

    @Column(name = "total", nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "costo_domicilio_historico", nullable = true, precision = 12, scale = 2)
    private BigDecimal costoDomicilioHistorico;

    @Column(name = "sucursal_id", nullable = true)
    private UUID sucursalId;

    @Column(name = "cuenta_mesa_id", nullable = true)
    private UUID cuentaMesaId;

    @Column(name = "nombre_cliente", nullable = true, length = 160)
    private String nombreCliente;

    @Column(name = "telefono_cliente", nullable = true, length = 30)
    private String telefonoCliente;

    @Column(name = "direccion_entrega", nullable = true, length = 240)
    private String direccionEntrega;

    @Column(name = "barrio", nullable = true, length = 120)
    private String barrio;

    @Column(name = "referencia_direccion", nullable = true, length = 240)
    private String referenciaDireccion;

    @Column(name = "ubicacion_consentida", nullable = false)
    private Boolean ubicacionConsentida = false;

    @Column(name = "latitud_entrega", nullable = true, precision = 9, scale = 6)
    private BigDecimal latitudEntrega;

    @Column(name = "longitud_entrega", nullable = true, precision = 9, scale = 6)
    private BigDecimal longitudEntrega;

    @Column(name = "nombre_destinatario", nullable = true, length = 160)
    private String nombreDestinatario;

    @Column(name = "telefono_destinatario", nullable = true, length = 30)
    private String telefonoDestinatario;

    public Pedido() {}

    public String getCodigoSeguimiento() { return codigoSeguimiento; }
    public void setCodigoSeguimiento(String codigoSeguimiento) { this.codigoSeguimiento = codigoSeguimiento; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getCanalOrigen() { return canalOrigen; }
    public void setCanalOrigen(String canalOrigen) { this.canalOrigen = canalOrigen; }

    public String getModalidadEntrega() { return modalidadEntrega; }
    public void setModalidadEntrega(String modalidadEntrega) { this.modalidadEntrega = modalidadEntrega; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Instant getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Instant fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Instant getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(Instant fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public BigDecimal getCostoDomicilioHistorico() { return costoDomicilioHistorico; }
    public void setCostoDomicilioHistorico(BigDecimal costoDomicilioHistorico) { this.costoDomicilioHistorico = costoDomicilioHistorico; }

    public UUID getSucursalId() { return sucursalId; }
    public void setSucursalId(UUID sucursalId) { this.sucursalId = sucursalId; }

    public UUID getCuentaMesaId() { return cuentaMesaId; }
    public void setCuentaMesaId(UUID cuentaMesaId) { this.cuentaMesaId = cuentaMesaId; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getTelefonoCliente() { return telefonoCliente; }
    public void setTelefonoCliente(String telefonoCliente) { this.telefonoCliente = telefonoCliente; }

    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }

    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public String getReferenciaDireccion() { return referenciaDireccion; }
    public void setReferenciaDireccion(String referenciaDireccion) { this.referenciaDireccion = referenciaDireccion; }

    public Boolean getUbicacionConsentida() { return ubicacionConsentida; }
    public void setUbicacionConsentida(Boolean ubicacionConsentida) { this.ubicacionConsentida = ubicacionConsentida; }

    public BigDecimal getLatitudEntrega() { return latitudEntrega; }
    public void setLatitudEntrega(BigDecimal latitudEntrega) { this.latitudEntrega = latitudEntrega; }

    public BigDecimal getLongitudEntrega() { return longitudEntrega; }
    public void setLongitudEntrega(BigDecimal longitudEntrega) { this.longitudEntrega = longitudEntrega; }

    public String getNombreDestinatario() { return nombreDestinatario; }
    public void setNombreDestinatario(String nombreDestinatario) { this.nombreDestinatario = nombreDestinatario; }

    public String getTelefonoDestinatario() { return telefonoDestinatario; }
    public void setTelefonoDestinatario(String telefonoDestinatario) { this.telefonoDestinatario = telefonoDestinatario; }
}

