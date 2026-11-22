package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.InventarioSucursal;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InventarioSucursalRepository extends JpaRepository<InventarioSucursal, UUID> {

    Optional<InventarioSucursal> findBySucursalIdAndProductoId(UUID sucursalId, UUID productoId);
    List<InventarioSucursal> findBySucursalId(UUID sucursalId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from InventarioSucursal i where i.sucursalId = :sucursalId and i.productoId = :productoId")
    Optional<InventarioSucursal> lockByBranchAndProduct(@Param("sucursalId") UUID sucursalId, @Param("productoId") UUID productoId);
    List<InventarioSucursal> findBySucursalIdOrderByProductoId(UUID sucursalId);
}
