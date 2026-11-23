package com.amankay.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.context.ConfigurableApplicationContext;
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
        boolean bootstrapCommand = java.util.Arrays.stream(args).anyMatch(argument ->
                argument.equals("--amankay.bootstrap-admin=true")
                        || argument.equals("--amankay.claim-integration-admin=true"));
        SpringApplication application = new SpringApplication(AmankayApplication.class);
        if (bootstrapCommand) application.setWebApplicationType(WebApplicationType.NONE);
        ConfigurableApplicationContext context = application.run(args);
        if (bootstrapCommand) SpringApplication.exit(context);
    }
}
