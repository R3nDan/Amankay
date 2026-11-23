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

/** Interactive, one-time local provisioning command. It is disabled unless explicitly requested. */
@Component
@ConditionalOnProperty(name = "amankay.bootstrap-admin", havingValue = "true")
public class BootstrapAdminRunner implements ApplicationRunner {
    private final BootstrapAdminService bootstrap;

    public BootstrapAdminRunner(BootstrapAdminService bootstrap) {
        this.bootstrap = bootstrap;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        Console console = System.console();
        if (console == null) {
            throw new IllegalStateException("El bootstrap requiere una terminal interactiva real. Ejecuta el comando desde PowerShell, no desde una consola redirigida o el IDE.");
        }

        BootstrapAdminService.BootstrapOptions options = bootstrap.inspect();
        if (options.administratorAlreadyExists()) {
            throw new IllegalStateException("Ya existe un usuario con el rol ADMINISTRADOR. El bootstrap inicial no creará otro.");
        }
        if (options.activeBranches().isEmpty()) {
            throw new IllegalStateException("No hay sucursales activas para asignar. Configura una sucursal válida antes de crear el administrador.");
        }

        console.printf("Bootstrap inicial de Amankay — no se iniciará el servidor HTTP.%n");
        console.printf("Sucursal(es) activa(s):%n");
        List<Sucursal> branches = options.activeBranches();
        for (int index = 0; index < branches.size(); index++) {
            Sucursal branch = branches.get(index);
            console.printf("  %d) %s — %s%n", index + 1, branch.getNombre(), branch.getDireccion());
        }

        String name = required(console.readLine("Nombre: "));
        String surname = required(console.readLine("Apellido: "));
        String phone = required(console.readLine("Teléfono: "));
        String email = required(console.readLine("Correo: ")).toLowerCase(Locale.ROOT);
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("El correo no tiene un formato válido.");
        }
        int branchNumber = parseBranch(console.readLine("Número de sucursal asignada: "), branches.size());

        char[] password = console.readPassword("Contraseña (mínimo 12 caracteres; entrada oculta): ");
        char[] confirmation = console.readPassword("Confirma la contraseña: ");
        try {
            if (password == null || confirmation == null || !Arrays.equals(password, confirmation)) {
                throw new IllegalArgumentException("Las contraseñas no coinciden.");
            }
            if (password.length < 12) {
                throw new IllegalArgumentException("La contraseña debe tener al menos 12 caracteres.");
            }
            if (new String(password).getBytes(StandardCharsets.UTF_8).length > 72) {
                throw new IllegalArgumentException("La contraseña supera el máximo seguro de 72 bytes UTF-8 para BCrypt.");
            }

            NewAdministrator request = new NewAdministrator(name, surname, phone, email, new String(password), branches.get(branchNumber - 1).getId());
            bootstrap.create(request);
            console.printf("Administrador creado correctamente y vinculado a la sucursal seleccionada.%n");
        } finally {
            if (password != null) Arrays.fill(password, '\0');
            if (confirmation != null) Arrays.fill(confirmation, '\0');
        }
    }

    private static String required(String value) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException("El dato solicitado no puede quedar vacío.");
        return value.trim();
    }

    private static int parseBranch(String value, int branchCount) {
        try {
            int selection = Integer.parseInt(value == null ? "" : value.trim());
            if (selection < 1 || selection > branchCount) throw new NumberFormatException();
            return selection;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Selecciona uno de los números de sucursal mostrados.");
        }
    }
}
