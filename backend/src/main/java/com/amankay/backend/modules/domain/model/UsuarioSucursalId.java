package com.amankay.backend.modules.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class UsuarioSucursalId implements Serializable {
    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;

    @Column(name = "sucursal_id", nullable = false)
    private UUID sucursalId;

    public UsuarioSucursalId() {}
    public UsuarioSucursalId(UUID usuarioId, UUID sucursalId) { this.usuarioId = usuarioId; this.sucursalId = sucursalId; }
    public UUID getUsuarioId() { return usuarioId; }
    public UUID getSucursalId() { return sucursalId; }
    public void setUsuarioId(UUID value) { this.usuarioId = value; }
    public void setSucursalId(UUID value) { this.sucursalId = value; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof UsuarioSucursalId that)) return false;
        return Objects.equals(usuarioId, that.usuarioId) && Objects.equals(sucursalId, that.sucursalId);
    }
    @Override public int hashCode() { return Objects.hash(usuarioId, sucursalId); }
}

