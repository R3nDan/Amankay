package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.UsuarioRol;
import com.amankay.backend.modules.domain.model.UsuarioRolId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRolRepository extends JpaRepository<UsuarioRol, UsuarioRolId> {
    @Query("select ur.id.rolId from UsuarioRol ur where ur.id.usuarioId = :usuarioId")
    List<UUID> findRoleIdsByUserId(@Param("usuarioId") UUID usuarioId);
}
