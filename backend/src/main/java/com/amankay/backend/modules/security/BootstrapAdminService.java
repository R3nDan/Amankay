package com.amankay.backend.modules.security;

import com.amankay.backend.modules.domain.model.Rol;
import com.amankay.backend.modules.domain.model.Sucursal;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.model.UsuarioRol;
import com.amankay.backend.modules.domain.model.UsuarioRolId;
import com.amankay.backend.modules.domain.model.UsuarioSucursal;
import com.amankay.backend.modules.domain.model.UsuarioSucursalId;
import com.amankay.backend.modules.domain.repository.RolRepository;
import com.amankay.backend.modules.domain.repository.SucursalRepository;
import com.amankay.backend.modules.domain.repository.UsuarioRepository;
import com.amankay.backend.modules.domain.repository.UsuarioRolRepository;
import com.amankay.backend.modules.domain.repository.UsuarioSucursalRepository;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Implements the one-time, local bootstrap using the approved domain associations. */
@Service
public class BootstrapAdminService {
    private static final String ADMIN_ROLE = "ADMINISTRADOR";

    private final UsuarioRepository users;
    private final RolRepository roles;
    private final SucursalRepository branches;
    private final UsuarioRolRepository userRoles;
    private final UsuarioSucursalRepository userBranches;
    private final PasswordEncoder passwords;

    public BootstrapAdminService(UsuarioRepository users, RolRepository roles, SucursalRepository branches,
            UsuarioRolRepository userRoles, UsuarioSucursalRepository userBranches, PasswordEncoder passwords) {
        this.users = users;
        this.roles = roles;
        this.branches = branches;
        this.userRoles = userRoles;
        this.userBranches = userBranches;
        this.passwords = passwords;
    }

    @Transactional(readOnly = true)
    public BootstrapOptions inspect() {
        Rol administrator = roles.findByNombreIgnoreCase(ADMIN_ROLE)
                .orElseThrow(() -> new IllegalStateException("No existe el rol ADMINISTRADOR. Aplica únicamente las migraciones ya autorizadas antes de usar el bootstrap."));
        return new BootstrapOptions(userRoles.existsByRoleId(administrator.getId()), branches.findByActivaTrueOrderByNombreAsc());
    }

    @Transactional
    public void create(NewAdministrator request) {
        if (request == null || isBlank(request.name()) || isBlank(request.surname()) || isBlank(request.phone())
                || isBlank(request.email()) || request.password() == null || request.password().length() < 12
                || request.password().getBytes(StandardCharsets.UTF_8).length > 72 || request.branchId() == null) {
            throw new IllegalArgumentException("Faltan datos obligatorios o la contraseña no cumple los límites permitidos. No se creó ningún usuario.");
        }
        Rol administrator = roles.findByNombreIgnoreCaseForUpdate(ADMIN_ROLE)
                .orElseThrow(() -> new IllegalStateException("No existe el rol ADMINISTRADOR. No se creó ningún usuario."));
        if (userRoles.existsByRoleId(administrator.getId())) {
            throw new IllegalStateException("Ya existe un usuario con el rol ADMINISTRADOR. El bootstrap inicial no creará otro.");
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByCorreoIgnoreCase(email)) {
            throw new IllegalStateException("El correo ya está registrado. No se alteró ninguna cuenta existente.");
        }
        Sucursal branch = branches.findById(request.branchId())
                .filter(row -> Boolean.TRUE.equals(row.getActiva()))
                .orElseThrow(() -> new IllegalStateException("La sucursal seleccionada no existe o está inactiva. No se creó el usuario."));

        Usuario user = new Usuario();
        user.setNombre(request.name().trim());
        user.setApellido(request.surname().trim());
        user.setCorreo(email);
        user.setTelefono(request.phone().trim());
        user.setPasswordHash(passwords.encode(request.password()));
        user.setActivo(true);
        user.setFechaCreacion(Instant.now());
        user = users.save(user);

        userRoles.save(new UsuarioRol(new UsuarioRolId(user.getId(), administrator.getId())));
        userBranches.save(new UsuarioSucursal(new UsuarioSucursalId(user.getId(), branch.getId())));
    }

    /** Claims only the existing integration-admin account shown by the read-only account lookup. */
    @Transactional
    public void claimIntegrationAdministrator(String currentEmail, NewAdministrator request) {
        if (currentEmail == null || !currentEmail.trim().toLowerCase(Locale.ROOT).startsWith("integration-admin@")) {
            throw new IllegalArgumentException("Solo se puede convertir la cuenta de integración integration-admin@….");
        }
        if (request == null || isBlank(request.name()) || isBlank(request.surname()) || isBlank(request.phone())
                || isBlank(request.email()) || request.password() == null || request.password().length() < 12
                || request.password().getBytes(StandardCharsets.UTF_8).length > 72 || request.branchId() == null) {
            throw new IllegalArgumentException("Faltan datos obligatorios o la contraseña no cumple los límites permitidos. No se modificó la cuenta.");
        }
        Rol administrator = roles.findByNombreIgnoreCaseForUpdate(ADMIN_ROLE)
                .orElseThrow(() -> new IllegalStateException("No existe el rol ADMINISTRADOR."));
        Usuario user = users.findByCorreoIgnoreCase(currentEmail.trim())
                .orElseThrow(() -> new IllegalStateException("No se encontró la cuenta de integración indicada."));
        if (!userRoles.userHasRole(user.getId(), administrator.getId()))
            throw new IllegalStateException("La cuenta indicada no tiene el rol ADMINISTRADOR.");
        if (userBranches.userHasAnyBranch(user.getId()))
            throw new IllegalStateException("La cuenta ya tiene una sucursal asignada. Se detuvo para no cambiar su alcance.");

        String email = request.email().trim().toLowerCase(Locale.ROOT);
        users.findByCorreoIgnoreCase(email).filter(existing -> !existing.getId().equals(user.getId())).ifPresent(existing -> {
            throw new IllegalStateException("El correo nuevo ya pertenece a otra cuenta. No se modificó ninguna cuenta.");
        });
        Sucursal branch = branches.findById(request.branchId()).filter(row -> Boolean.TRUE.equals(row.getActiva()))
                .orElseThrow(() -> new IllegalStateException("La sucursal seleccionada no existe o está inactiva."));

        user.setNombre(request.name().trim());
        user.setApellido(request.surname().trim());
        user.setCorreo(email);
        user.setTelefono(request.phone().trim());
        user.setPasswordHash(passwords.encode(request.password()));
        user.setActivo(true);
        users.save(user);
        userBranches.save(new UsuarioSucursal(new UsuarioSucursalId(user.getId(), branch.getId())));
    }

    public record BootstrapOptions(boolean administratorAlreadyExists, List<Sucursal> activeBranches) {}
    public record NewAdministrator(String name, String surname, String phone, String email, String password, UUID branchId) {}

    private static boolean isBlank(String value) { return value == null || value.isBlank(); }
}
