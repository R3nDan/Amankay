package com.amankay.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Punto de entrada del backend REST de Amankay.
 */
@SpringBootApplication
@EnableScheduling
public class AmankayApplication {

    /**
     * Inicia la aplicación Spring Boot.
     *
     * @param args argumentos de línea de comandos
     */
    public static void main(String[] args) {
        SpringApplication.run(AmankayApplication.class, args);
    }
}
