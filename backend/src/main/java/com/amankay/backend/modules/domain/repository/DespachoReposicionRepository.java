package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.DespachoReposicion;
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
public interface DespachoReposicionRepository extends JpaRepository<DespachoReposicion, UUID> {

    List<DespachoReposicion> findBySolicitudIdOrderByFechaDespachoAsc(UUID solicitudId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from DespachoReposicion d where d.id = :id")
    Optional<DespachoReposicion> lockById(@Param("id") UUID id);
}
