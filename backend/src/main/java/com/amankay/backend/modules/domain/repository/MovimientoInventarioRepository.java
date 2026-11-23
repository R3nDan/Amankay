package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.MovimientoInventario;
import java.util.List;
import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, UUID> {

    List<MovimientoInventario> findByInventarioSucursalIdOrderByFechaHoraDesc(UUID inventarioSucursalId);
    List<MovimientoInventario> findByInventarioSucursalIdInOrderByFechaHoraDesc(Collection<UUID> inventarioSucursalIds);
    boolean existsByMovimientoCompensadoId(UUID movimientoCompensadoId);
    Optional<MovimientoInventario> findByTipoOrigenAndIdOrigen(String tipoOrigen, UUID idOrigen);
    List<MovimientoInventario> findByTipoOrigenAndIdOrigenOrderByFechaHoraAsc(String tipoOrigen, UUID idOrigen);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select m from MovimientoInventario m where m.id = :id")
    Optional<MovimientoInventario> lockById(@org.springframework.data.repository.query.Param("id") UUID id);
}
