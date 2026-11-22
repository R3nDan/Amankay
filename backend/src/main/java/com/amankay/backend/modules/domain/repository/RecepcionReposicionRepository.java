package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.RecepcionReposicion;
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
public interface RecepcionReposicionRepository extends JpaRepository<RecepcionReposicion, UUID> {

    List<RecepcionReposicion> findByDespachoIdOrderByFechaRecepcionAsc(UUID despachoId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from RecepcionReposicion r where r.id = :id")
    Optional<RecepcionReposicion> lockById(@Param("id") UUID id);
}
