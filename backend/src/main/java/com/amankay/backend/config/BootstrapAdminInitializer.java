package com.amankay.backend.config;

import com.amankay.backend.modules.domain.model.Rol;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.model.UsuarioRol;
import com.amankay.backend.modules.domain.model.UsuarioRolId;
import com.amankay.backend.modules.domain.repository.RolRepository;
import com.amankay.backend.modules.domain.repository.UsuarioRepository;
import com.amankay.backend.modules.domain.repository.UsuarioRolRepository;
import java.time.Instant;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Creates the first administrator only when explicitly provisioned through process environment variables. */
@Component
public class BootstrapAdminInitializer implements ApplicationRunner {
    private final String email;
    private final String password;
    private final String name;
    private final String surname;
    private final String phone;
    private final UsuarioRepository users;
    private final RolRepository roles;
    private final UsuarioRolRepository userRoles;
    private final PasswordEncoder passwords;

    public BootstrapAdminInitializer(
            @Value("${AMANKAY_BOOTSTRAP_ADMIN_EMAIL:}") String email,
            @Value("${AMANKAY_BOOTSTRAP_ADMIN_PASSWORD:}") String password,
            @Value("${AMANKAY_BOOTSTRAP_ADMIN_NAME:}") String name,
            @Value("${AMANKAY_BOOTSTRAP_ADMIN_SURNAME:}") String surname,
            @Value("${AMANKAY_BOOTSTRAP_ADMIN_PHONE:}") String phone,
            UsuarioRepository users, RolRepository roles, UsuarioRolRepository userRoles, PasswordEncoder passwords) {
        this.email = email; this.password = password; this.name = name; this.surname = surname; this.phone = phone;
        this.users = users; this.roles = roles; this.userRoles = userRoles; this.passwords = passwords;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        if (email.isBlank()) return;
        if (password.isBlank() || name.isBlank() || surname.isBlank() || phone.isBlank())
            throw new IllegalStateException("La provisión inicial de administrador requiere todas las variables AMANKAY_BOOTSTRAP_ADMIN_*.");
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (users.existsByCorreoIgnoreCase(normalizedEmail)) return;
        if (password.length() < 12) throw new IllegalStateException("La contraseña inicial de administrador debe tener al menos 12 caracteres.");
        Rol admin = roles.findByNombreIgnoreCase("ADMINISTRADOR")
                .orElseThrow(() -> new IllegalStateException("No existe el rol ADMINISTRADOR; aplica primero las migraciones autorizadas."));
        Usuario user = new Usuario(); user.setNombre(name.trim()); user.setApellido(surname.trim()); user.setCorreo(normalizedEmail);
        user.setTelefono(phone.trim()); user.setPasswordHash(passwords.encode(password)); user.setActivo(true); user.setFechaCreacion(Instant.now());
        user = users.save(user);
        userRoles.save(new UsuarioRol(new UsuarioRolId(user.getId(), admin.getId())));
    }
}
