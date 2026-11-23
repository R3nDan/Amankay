package com.amankay.backend.modules.security;

import com.amankay.backend.modules.common.DomainException;
import com.amankay.backend.modules.domain.model.Usuario;
import com.amankay.backend.modules.domain.repository.UsuarioRepository;
import com.amankay.backend.modules.domain.repository.UsuarioSucursalRepository;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class StaffAccess {
    private final UsuarioRepository users;
    private final UsuarioSucursalRepository branches;

    public StaffAccess(UsuarioRepository users, UsuarioSucursalRepository branches) {
        this.users = users;
        this.branches = branches;
    }

    public Usuario currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw DomainException.forbidden("Se requiere una sesión de personal.");
        }
        return users.findByCorreoIgnoreCase(authentication.getName())
                .filter(user -> Boolean.TRUE.equals(user.getActivo()))
                .orElseThrow(() -> DomainException.forbidden("La cuenta de personal no está activa."));
    }

    public UUID currentUserId() { return currentUser().getId(); }

    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }

    public void requireRole(String role) {
        if (!hasRole(role)) throw DomainException.forbidden("No tienes el rol requerido para esta operación.");
    }

    public void requireRoleAtBranch(String role, UUID branchId) {
        requireRole(role);
        Usuario user = currentUser();
        if (!branches.userHasBranch(user.getId(), branchId)) {
            throw DomainException.forbidden("No tienes asignada la sucursal indicada.");
        }
    }

    public void requireRoleWithAnyBranch(String role) {
        requireRole(role);
        Usuario user = currentUser();
        if (!branches.userHasAnyBranch(user.getId())) {
            throw DomainException.forbidden("No tienes sucursales asignadas para esta operación.");
        }
    }

    public void requireRoleAtEitherBranch(String role, UUID firstBranchId, UUID secondBranchId) {
        requireRole(role);
        UUID userId = currentUser().getId();
        if (!branches.userHasBranch(userId, firstBranchId) && !branches.userHasBranch(userId, secondBranchId)) {
            throw DomainException.forbidden("No tienes asignada ninguna de las sucursales de esta operación.");
        }
    }

    public void requireRoleAtBranchOrAdmin(String role, UUID branchId) {
        if (hasRole("ADMINISTRADOR")) { currentUser(); return; }
        requireRoleAtBranch(role, branchId);
    }
}
