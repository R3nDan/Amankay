package com.amankay.backend.config;

import com.amankay.backend.modules.domain.model.Sucursal;
import com.amankay.backend.modules.security.BootstrapAdminService;
import com.amankay.backend.modules.security.BootstrapAdminService.NewAdministrator;
import java.io.Console;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** One-time interactive conversion of the dedicated integration administrator into the user's account. */
@Component
@ConditionalOnProperty(name = "amankay.claim-integration-admin", havingValue = "true")
public class ClaimIntegrationAdminRunner implements ApplicationRunner {
    private final BootstrapAdminService service;
    public ClaimIntegrationAdminRunner(BootstrapAdminService service) { this.service = service; }

    @Override public void run(ApplicationArguments arguments) {
        Console console = System.console();
        if (console == null) throw new IllegalStateException("Ejecuta este comando desde una terminal PowerShell interactiva.");
        var options = service.inspect();
        List<Sucursal> branches = options.activeBranches();
        if (branches.isEmpty()) throw new IllegalStateException("No hay sucursales activas disponibles.");
        console.printf("Se convertirá únicamente la cuenta integration-admin@…; su ID y rol se conservan.%n");
        String oldEmail = required(console.readLine("Correo actual exacto de la cuenta de integración: "));
        console.printf("Sucursales activas:%n");
        for (int i = 0; i < branches.size(); i++) console.printf("  %d) %s — %s%n", i + 1, branches.get(i).getNombre(), branches.get(i).getDireccion());
        String name = required(console.readLine("Tu nombre: "));
        String surname = required(console.readLine("Tu apellido: "));
        String phone = required(console.readLine("Tu teléfono: "));
        String email = required(console.readLine("Tu correo de acceso: ")).toLowerCase(Locale.ROOT);
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) throw new IllegalArgumentException("El correo no tiene un formato válido.");
        int branch = parseBranch(console.readLine("Número de sucursal: "), branches.size());
        char[] password = console.readPassword("Nueva contraseña (mínimo 12 caracteres; entrada oculta): ");
        char[] confirm = console.readPassword("Confirma la contraseña: ");
        try {
            if (password == null || confirm == null || !Arrays.equals(password, confirm)) throw new IllegalArgumentException("Las contraseñas no coinciden.");
            if (password.length < 12 || new String(password).getBytes(StandardCharsets.UTF_8).length > 72) throw new IllegalArgumentException("La contraseña debe tener entre 12 y 72 bytes UTF-8.");
            service.claimIntegrationAdministrator(oldEmail, new NewAdministrator(name, surname, phone, email,
                    new String(password), branches.get(branch - 1).getId()));
            console.printf("Cuenta de integración convertida. Ya puedes iniciar sesión con tu correo y contraseña.%n");
        } finally { if (password != null) Arrays.fill(password, '\0'); if (confirm != null) Arrays.fill(confirm, '\0'); }
    }

    private static String required(String value) { if (value == null || value.isBlank()) throw new IllegalArgumentException("El dato no puede quedar vacío."); return value.trim(); }
    private static int parseBranch(String value, int count) { try { int n = Integer.parseInt(value.trim()); if (n < 1 || n > count) throw new NumberFormatException(); return n; } catch (Exception e) { throw new IllegalArgumentException("Selecciona un número de sucursal mostrado."); } }
}
