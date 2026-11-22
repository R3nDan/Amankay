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
@Table(name = "registro_auditoria")
public class RegistroAuditoria extends BaseEntity {

    @Column(name = "fecha_hora", nullable = false)
    private Instant fechaHora;

    @Column(name = "operacion", nullable = false, length = 80)
    private String operacion;

    @Column(name = "entidad", nullable = false, length = 80)
    private String entidad;

    @Column(name = "entidad_id", nullable = true)
    private UUID entidadId;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "valor_anterior", nullable = true, columnDefinition = "jsonb")
    private String valorAnterior;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "valor_nuevo", nullable = true, columnDefinition = "jsonb")
    private String valorNuevo;

    @Column(name = "descripcion", nullable = true, length = 1000)
    private String descripcion;

    @Column(name = "tipo_actor", nullable = false, length = 12)
    private String tipoActor;

    @Column(name = "usuario_id", nullable = true)
    private UUID usuarioId;

    public RegistroAuditoria() {}

    public Instant getFechaHora() { return fechaHora; }
    public void setFechaHora(Instant fechaHora) { this.fechaHora = fechaHora; }

    public String getOperacion() { return operacion; }
    public void setOperacion(String operacion) { this.operacion = operacion; }

    public String getEntidad() { return entidad; }
    public void setEntidad(String entidad) { this.entidad = entidad; }

    public UUID getEntidadId() { return entidadId; }
    public void setEntidadId(UUID entidadId) { this.entidadId = entidadId; }

    public String getValorAnterior() { return valorAnterior; }
    public void setValorAnterior(String valorAnterior) { this.valorAnterior = valorAnterior; }

    public String getValorNuevo() { return valorNuevo; }
    public void setValorNuevo(String valorNuevo) { this.valorNuevo = valorNuevo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getTipoActor() { return tipoActor; }
    public void setTipoActor(String tipoActor) { this.tipoActor = tipoActor; }

    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }
}

