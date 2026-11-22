package com.amankay.backend.modules.health;

/**
 * Respuesta de la comprobación técnica de la API.
 *
 * @param status estado del proceso REST
 */
public record HealthResponse(String status) {
}
