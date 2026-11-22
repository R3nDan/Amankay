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
@Table(name = "mesa")
public class Mesa extends BaseEntity {

    @Column(name = "sucursal_id", nullable = false)
    private UUID sucursalId;

    @Column(name = "identificador", nullable = false, length = 40)
    private String identificador;

    @Column(name = "identificador_qr", nullable = false, length = 120)
    private String identificadorQr;

    @Column(name = "activa", nullable = false)
    private Boolean activa;

    public Mesa() {}

    public UUID getSucursalId() { return sucursalId; }
    public void setSucursalId(UUID sucursalId) { this.sucursalId = sucursalId; }

    public String getIdentificador() { return identificador; }
    public void setIdentificador(String identificador) { this.identificador = identificador; }

    public String getIdentificadorQr() { return identificadorQr; }
    public void setIdentificadorQr(String identificadorQr) { this.identificadorQr = identificadorQr; }

    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
}

