package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.UsuarioSucursal;
import com.amankay.backend.modules.domain.model.UsuarioSucursalId;
import java.util.UUID;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioSucursalRepository extends JpaRepository<UsuarioSucursal, UsuarioSucursalId> {
    @Query("select us.id.sucursalId from UsuarioSucursal us where us.id.usuarioId = :usuarioId")
    List<UUID> findBranchIdsByUserId(@Param("usuarioId") UUID usuarioId);
    @Query("select us.id.usuarioId from UsuarioSucursal us where us.id.sucursalId = :sucursalId")
    List<UUID> findUserIdsByBranchId(@Param("sucursalId") UUID sucursalId);
    @Query("select case when count(us) > 0 then true else false end from UsuarioSucursal us where us.id.usuarioId = :usuarioId and us.id.sucursalId = :sucursalId")
    boolean userHasBranch(@Param("usuarioId") UUID usuarioId, @Param("sucursalId") UUID sucursalId);

    @Query("select case when count(us) > 0 then true else false end from UsuarioSucursal us where us.id.usuarioId = :usuarioId")
    boolean userHasAnyBranch(@Param("usuarioId") UUID usuarioId);
}
