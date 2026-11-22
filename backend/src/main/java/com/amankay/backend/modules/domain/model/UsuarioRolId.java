package com.amankay.backend.modules.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class UsuarioRolId implements Serializable {
    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;

    @Column(name = "rol_id", nullable = false)
    private UUID rolId;

    public UsuarioRolId() {}
    public UsuarioRolId(UUID usuarioId, UUID rolId) { this.usuarioId = usuarioId; this.rolId = rolId; }
    public UUID getUsuarioId() { return usuarioId; }
    public UUID getRolId() { return rolId; }
    public void setUsuarioId(UUID value) { this.usuarioId = value; }
    public void setRolId(UUID value) { this.rolId = value; }

    @Override public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof UsuarioRolId that)) return false;
        return Objects.equals(usuarioId, that.usuarioId) && Objects.equals(rolId, that.rolId);
    }
    @Override public int hashCode() { return Objects.hash(usuarioId, rolId); }
}

