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
@Table(name = "movimiento_inventario")
public class MovimientoInventario extends BaseEntity {

    @Column(name = "inventario_sucursal_id", nullable = false)
    private UUID inventarioSucursalId;

    @Column(name = "usuario_id", nullable = true)
    private UUID usuarioId;

    @Column(name = "tipo", nullable = false, length = 32)
    private String tipo;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "stock_anterior", nullable = false)
    private Integer stockAnterior;

    @Column(name = "stock_resultante", nullable = false)
    private Integer stockResultante;

    @Column(name = "fecha_hora", nullable = false)
    private Instant fechaHora;

    @Column(name = "motivo", nullable = false, length = 500)
    private String motivo;

    @Column(name = "tipo_origen", nullable = false, length = 40)
    private String tipoOrigen;

    @Column(name = "id_origen", nullable = false)
    private UUID idOrigen;

    @Column(name = "movimiento_compensado_id", nullable = true)
    private UUID movimientoCompensadoId;

    public MovimientoInventario() {}

    public UUID getInventarioSucursalId() { return inventarioSucursalId; }
    public void setInventarioSucursalId(UUID inventarioSucursalId) { this.inventarioSucursalId = inventarioSucursalId; }

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public Integer getStockAnterior() { return stockAnterior; }
    public void setStockAnterior(Integer stockAnterior) { this.stockAnterior = stockAnterior; }

    public Integer getStockResultante() { return stockResultante; }
    public void setStockResultante(Integer stockResultante) { this.stockResultante = stockResultante; }

    public Instant getFechaHora() { return fechaHora; }
    public void setFechaHora(Instant fechaHora) { this.fechaHora = fechaHora; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getTipoOrigen() { return tipoOrigen; }
    public void setTipoOrigen(String tipoOrigen) { this.tipoOrigen = tipoOrigen; }

    public UUID getIdOrigen() { return idOrigen; }
    public void setIdOrigen(UUID idOrigen) { this.idOrigen = idOrigen; }

    public UUID getMovimientoCompensadoId() { return movimientoCompensadoId; }
    public void setMovimientoCompensadoId(UUID movimientoCompensadoId) { this.movimientoCompensadoId = movimientoCompensadoId; }
}

