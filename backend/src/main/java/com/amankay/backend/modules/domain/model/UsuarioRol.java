package com.amankay.backend.modules.domain.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Associative entity approved in the MER. */
@Entity
@Table(name = "usuario_rol")
public class UsuarioRol {
    @EmbeddedId
    private UsuarioRolId id;
    public UsuarioRol() {}
    public UsuarioRol(UsuarioRolId id) { this.id = id; }
    public UsuarioRolId getId() { return id; }
    public void setId(UsuarioRolId id) { this.id = id; }
}

