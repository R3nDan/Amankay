package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.DetalleDespachoReposicion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface DetalleDespachoReposicionRepository extends JpaRepository<DetalleDespachoReposicion, UUID> {

    List<DetalleDespachoReposicion> findByDespachoIdOrderById(UUID despachoId);
    List<DetalleDespachoReposicion> findByDetalleSolicitudIdOrderById(UUID detalleSolicitudId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from DetalleDespachoReposicion d where d.id = :id")
    Optional<DetalleDespachoReposicion> lockById(@Param("id") UUID id);
}
