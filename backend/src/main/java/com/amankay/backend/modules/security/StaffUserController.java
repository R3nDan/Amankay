package com.amankay.backend.modules.security;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.Rol;
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
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class StaffUserController {
    private final UsuarioRepository users;
    private final RolRepository roles;
    private final SucursalRepository branches;
    private final UsuarioRolRepository userRoles;
    private final UsuarioSucursalRepository userBranches;
    private final PasswordEncoder passwords;
    private final StaffAccess access;

    public StaffUserController(UsuarioRepository users, RolRepository roles, SucursalRepository branches,
            UsuarioRolRepository userRoles, UsuarioSucursalRepository userBranches, PasswordEncoder passwords, StaffAccess access) {
        this.users = users; this.roles = roles; this.branches = branches;
        this.userRoles = userRoles; this.userBranches = userBranches; this.passwords = passwords;
        this.access = access;
    }

    @GetMapping
    public List<UserView> list() { return users.findAll().stream().map(this::view).toList(); }

    @GetMapping("/roles")
    public List<RoleView> availableRoles() {
        return roles.findAll().stream().map(row -> new RoleView(row.getNombre(), row.getDescripcion())).toList();
    }

    @PostMapping
    @Transactional
    public UserView create(@Valid @RequestBody CreateUserRequest body) {
        String email = body.correo().trim().toLowerCase(Locale.ROOT);
        if (users.existsByCorreoIgnoreCase(email)) throw DomainException.conflict("Ya existe una cuenta con ese correo.");
        Set<Rol> assignedRoles = resolveRoles(body.roles());
        Set<UUID> branchIds = resolveBranches(body.sucursales());
        requireBranchScope(assignedRoles, branchIds);
        Usuario user = new Usuario();
        user.setNombre(body.nombre().trim()); user.setApellido(body.apellido().trim());
        user.setCorreo(email); user.setTelefono(body.telefono().trim());
        user.setPasswordHash(passwords.encode(body.contrasena())); user.setActivo(true); user.setFechaCreacion(Instant.now());
        user = users.save(user);
        for (Rol role : assignedRoles) userRoles.save(new UsuarioRol(new UsuarioRolId(user.getId(), role.getId())));
        for (UUID branchId : branchIds) userBranches.save(new UsuarioSucursal(new UsuarioSucursalId(user.getId(), branchId)));
        return view(user);
    }

    @PutMapping("/{id}/assignments")
    @Transactional
    public UserView assignments(@PathVariable UUID id, @Valid @RequestBody AssignmentsRequest body) {
        Usuario user = users.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró el usuario."));
        Set<Rol> assignedRoles = resolveRoles(body.roles());
        Set<UUID> branchIds = resolveBranches(body.sucursales());
        requireBranchScope(assignedRoles, branchIds);
        if (id.equals(access.currentUserId()) && assignedRoles.stream().noneMatch(role -> "ADMINISTRADOR".equals(role.getNombre())))
            throw DomainException.conflict("No puedes retirar tu propio rol de administración.");
        userRoles.findAll().stream().filter(row -> row.getId().getUsuarioId().equals(id)).forEach(userRoles::delete);
        userBranches.findAll().stream().filter(row -> row.getId().getUsuarioId().equals(id)).forEach(userBranches::delete);
        for (Rol role : assignedRoles) userRoles.save(new UsuarioRol(new UsuarioRolId(id, role.getId())));
        for (UUID branchId : branchIds) userBranches.save(new UsuarioSucursal(new UsuarioSucursalId(id, branchId)));
        return view(user);
    }

    @PatchMapping("/{id}/deactivate")
    @Transactional
    public UserView deactivate(@PathVariable UUID id) {
        if (id.equals(access.currentUserId())) throw DomainException.conflict("No puedes desactivar tu propia cuenta.");
        Usuario user = users.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró el usuario."));
        user.setActivo(false);
        return view(users.save(user));
    }

    @PatchMapping("/{id}/activate")
    @Transactional
    public UserView activate(@PathVariable UUID id) {
        Usuario user = users.findById(id).orElseThrow(() -> DomainException.notFound("No se encontró el usuario."));
        user.setActivo(true);
        return view(users.save(user));
    }

    private Set<Rol> resolveRoles(List<String> names) {
        if (names == null || names.isEmpty()) throw new DomainException(HttpStatus.BAD_REQUEST, "Asigna al menos un rol.");
        Set<Rol> found = new HashSet<>();
        for (String name : names) found.add(roles.findByNombreIgnoreCase(name).orElseThrow(() -> DomainException.notFound("Rol no reconocido: " + name)));
        return found;
    }

    private Set<UUID> resolveBranches(List<UUID> ids) {
        Set<UUID> found = new HashSet<>(ids == null ? List.of() : ids);
        if (found.size() != (ids == null ? 0 : ids.size())) throw new DomainException(HttpStatus.BAD_REQUEST, "No repitas sucursales.");
        if (branches.findAllById(found).size() != found.size()) throw DomainException.notFound("Una de las sucursales no existe.");
        return found;
    }

    private void requireBranchScope(Set<Rol> roles, Set<UUID> branchIds) {
        boolean operational = roles.stream().anyMatch(role -> !"ADMINISTRADOR".equalsIgnoreCase(role.getNombre()));
        if (operational && branchIds.isEmpty()) throw new DomainException(HttpStatus.BAD_REQUEST, "Los roles operativos requieren al menos una sucursal asignada.");
    }

    private UserView view(Usuario user) {
        List<String> roleNames = roles.findAllById(userRoles.findRoleIdsByUserId(user.getId())).stream().map(Rol::getNombre).sorted().toList();
        List<UUID> branchIds = userBranches.findAll().stream().map(UsuarioSucursal::getId)
                .filter(assignment -> assignment.getUsuarioId().equals(user.getId())).map(UsuarioSucursalId::getSucursalId).sorted().toList();
        return new UserView(user.getId(), user.getNombre(), user.getApellido(), user.getCorreo(), user.getTelefono(), user.getActivo(), roleNames, branchIds);
    }

    public record CreateUserRequest(@NotBlank String nombre, @NotBlank String apellido, @NotBlank @Email String correo,
            @NotBlank String telefono, @NotBlank @Pattern(regexp = ".{12,}", message = "Usa al menos 12 caracteres.") String contrasena,
            @NotEmpty List<String> roles, List<UUID> sucursales) {}
    public record AssignmentsRequest(@NotEmpty List<String> roles, List<UUID> sucursales) {}
    public record UserView(UUID id, String nombre, String apellido, String correo, String telefono, Boolean activo,
            List<String> roles, List<UUID> sucursales) {}
    public record RoleView(String nombre, String descripcion) {}
}
