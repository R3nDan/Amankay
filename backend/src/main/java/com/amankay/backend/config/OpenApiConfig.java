package com.amankay.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Metadatos generales de la especificación OpenAPI de Amankay.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Construye los metadatos visibles en Swagger UI.
     *
     * @return información pública de la API
     */
    @Bean
    public OpenAPI amankayOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Amankay API")
                        .description("API REST de Amankay para catálogo, pedidos, operación de sucursales, inventario y reportes.")
                        .version("1.0.0"));
    }
}
