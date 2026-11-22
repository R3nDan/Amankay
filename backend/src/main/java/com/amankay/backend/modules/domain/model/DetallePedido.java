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
@Table(name = "detalle_pedido")
public class DetallePedido extends BaseEntity {

    @Column(name = "pedido_id", nullable = false)
    private UUID pedidoId;

    @Column(name = "producto_id", nullable = false)
    private UUID productoId;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario_historico", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitarioHistorico;

    @Column(name = "nombre_producto_historico", nullable = false, length = 120)
    private String nombreProductoHistorico;

    public DetallePedido() {}

    public UUID getPedidoId() { return pedidoId; }
    public void setPedidoId(UUID pedidoId) { this.pedidoId = pedidoId; }

    public UUID getProductoId() { return productoId; }
    public void setProductoId(UUID productoId) { this.productoId = productoId; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public BigDecimal getPrecioUnitarioHistorico() { return precioUnitarioHistorico; }
    public void setPrecioUnitarioHistorico(BigDecimal precioUnitarioHistorico) { this.precioUnitarioHistorico = precioUnitarioHistorico; }

    public String getNombreProductoHistorico() { return nombreProductoHistorico; }
    public void setNombreProductoHistorico(String nombreProductoHistorico) { this.nombreProductoHistorico = nombreProductoHistorico; }
}

