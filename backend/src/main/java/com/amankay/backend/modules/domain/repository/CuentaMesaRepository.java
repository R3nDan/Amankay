package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.CuentaMesa;
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
public interface CuentaMesaRepository extends JpaRepository<CuentaMesa, UUID> {

    Optional<CuentaMesa> findBySesionMesaId(UUID sesionMesaId);
    List<CuentaMesa> findByEstado(String estado);
    boolean existsBySesionMesaIdAndEstado(UUID sesionMesaId, String estado);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CuentaMesa c where c.id = :id")
    Optional<CuentaMesa> lockById(@Param("id") UUID id);
}
