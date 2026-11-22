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
@Table(name = "inventario_sucursal")
public class InventarioSucursal extends BaseEntity {

    @Column(name = "sucursal_id", nullable = false)
    private UUID sucursalId;

    @Column(name = "producto_id", nullable = false)
    private UUID productoId;

    @Column(name = "stock_disponible", nullable = false)
    private Integer stockDisponible;

    @Column(name = "fecha_actualizacion", nullable = false)
    private Instant fechaActualizacion;

    public InventarioSucursal() {}

    public UUID getSucursalId() { return sucursalId; }
    public void setSucursalId(UUID sucursalId) { this.sucursalId = sucursalId; }

    public UUID getProductoId() { return productoId; }
    public void setProductoId(UUID productoId) { this.productoId = productoId; }

    public Integer getStockDisponible() { return stockDisponible; }
    public void setStockDisponible(Integer stockDisponible) { this.stockDisponible = stockDisponible; }

    public Instant getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(Instant fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}

