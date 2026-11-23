package com.amankay.backend.modules.security;

import com.amankay.backend.modules.domain.model.Rol;
import com.amankay.backend.modules.domain.model.Sucursal;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.model.UsuarioRol;
import com.amankay.backend.modules.domain.model.UsuarioSucursal;
import com.amankay.backend.modules.domain.repository.RolRepository;
import com.amankay.backend.modules.domain.repository.SucursalRepository;
import com.amankay.backend.modules.domain.repository.UsuarioRepository;
import com.amankay.backend.modules.domain.repository.UsuarioRolRepository;
import com.amankay.backend.modules.domain.repository.UsuarioSucursalRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BootstrapAdminServiceTest {
    private final UsuarioRepository users = mock(UsuarioRepository.class);
    private final RolRepository roles = mock(RolRepository.class);
    private final SucursalRepository branches = mock(SucursalRepository.class);
    private final UsuarioRolRepository userRoles = mock(UsuarioRolRepository.class);
    private final UsuarioSucursalRepository userBranches = mock(UsuarioSucursalRepository.class);
    private final PasswordEncoder encoder = new BCryptPasswordEncoder(4);
    private final BootstrapAdminService service = new BootstrapAdminService(users, roles, branches, userRoles, userBranches, encoder);
    private final UUID roleId = UUID.randomUUID();
    private final UUID branchId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        Rol role = new Rol(); role.setId(roleId); role.setNombre("ADMINISTRADOR");
        Sucursal branch = new Sucursal(); branch.setId(branchId); branch.setNombre("Sede principal"); branch.setActiva(true);
        when(roles.findByNombreIgnoreCaseForUpdate("ADMINISTRADOR")).thenReturn(Optional.of(role));
        when(userRoles.existsByRoleId(roleId)).thenReturn(false);
        when(users.existsByCorreoIgnoreCase("admin@amankay.test")).thenReturn(false);
        when(branches.findById(branchId)).thenReturn(Optional.of(branch));
        when(users.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });
    }

    @Test
    void createsUserWithEncodedPasswordAndApprovedAssociations() {
        String rawPassword = "ClaveSeguraDePrueba25";
        service.create(new BootstrapAdminService.NewAdministrator("Ana", "Panadera", "3001234567",
                "Admin@Amankay.test", rawPassword, branchId));

        var userCaptor = org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(users).save(userCaptor.capture());
        Usuario stored = userCaptor.getValue();
        assertThat(stored.getCorreo()).isEqualTo("admin@amankay.test");
        assertThat(stored.getPasswordHash()).isNotEqualTo(rawPassword);
        assertThat(encoder.matches(rawPassword, stored.getPasswordHash())).isTrue();

        var roleCaptor = org.mockito.ArgumentCaptor.forClass(UsuarioRol.class);
        verify(userRoles).save(roleCaptor.capture());
        assertThat(roleCaptor.getValue().getId().getUsuarioId()).isEqualTo(stored.getId());
        assertThat(roleCaptor.getValue().getId().getRolId()).isEqualTo(roleId);

        var branchCaptor = org.mockito.ArgumentCaptor.forClass(UsuarioSucursal.class);
        verify(userBranches).save(branchCaptor.capture());
        assertThat(branchCaptor.getValue().getId().getUsuarioId()).isEqualTo(stored.getId());
        assertThat(branchCaptor.getValue().getId().getSucursalId()).isEqualTo(branchId);
    }

    @Test
    void refusesToCreateSecondAdministratorWithoutSaving() {
        when(userRoles.existsByRoleId(roleId)).thenReturn(true);

        assertThatThrownBy(() -> service.create(new BootstrapAdminService.NewAdministrator("Ana", "Panadera", "3001234567",
                "admin@amankay.test", "ClaveSeguraDePrueba25", branchId)))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Ya existe");
        verify(users, never()).save(any());
    }

    @Test
    void refusesAnAlreadyRegisteredEmailWithoutSaving() {
        when(users.existsByCorreoIgnoreCase("admin@amankay.test")).thenReturn(true);

        assertThatThrownBy(() -> service.create(new BootstrapAdminService.NewAdministrator("Ana", "Panadera", "3001234567",
                "admin@amankay.test", "ClaveSeguraDePrueba25", branchId)))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("correo ya está registrado");
        verify(users, never()).save(any());
    }
}
