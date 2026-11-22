package com.amankay.backend.modules.domain.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Associative entity approved in the MER. */
@Entity
@Table(name = "usuario_sucursal")
public class UsuarioSucursal {
    @EmbeddedId
    private UsuarioSucursalId id;
    public UsuarioSucursal() {}
    public UsuarioSucursal(UsuarioSucursalId id) { this.id = id; }
    public UsuarioSucursalId getId() { return id; }
    public void setId(UsuarioSucursalId id) { this.id = id; }
}

