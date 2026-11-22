package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.SolicitudReposicion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitudReposicionRepository extends JpaRepository<SolicitudReposicion, UUID> {

    List<SolicitudReposicion> findByEstadoOrderByFechaSolicitudAsc(String estado);
    List<SolicitudReposicion> findBySucursalSolicitanteIdOrderByFechaSolicitudDesc(UUID sucursalSolicitanteId);
    List<SolicitudReposicion> findBySucursalProveedoraIdAndEstadoOrderByFechaSolicitudAsc(UUID sucursalProveedoraId, String estado);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from SolicitudReposicion r where r.id = :id")
    Optional<SolicitudReposicion> lockById(@Param("id") UUID id);
}
