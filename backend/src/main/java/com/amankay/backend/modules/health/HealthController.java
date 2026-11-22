package com.amankay.backend.modules.health;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Expone una comprobación técnica que no consulta servicios externos.
 */
@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Salud", description = "Comprobaciones técnicas de la API")
public class HealthController {

    /**
     * Indica que el proceso de la API está atendiendo solicitudes.
     *
     * @return estado del proceso, sin comprobar PostgreSQL
     */
    @GetMapping
    @Operation(summary = "Comprobar disponibilidad de la API",
            description = "Confirma que el proceso REST responde; no verifica PostgreSQL ni otros servicios.")
    public HealthResponse health() {
        return new HealthResponse("UP");
    }
}
