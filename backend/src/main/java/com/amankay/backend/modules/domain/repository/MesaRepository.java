package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.Mesa;
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
public interface MesaRepository extends JpaRepository<Mesa, UUID> {

    Optional<Mesa> findBySucursalIdAndIdentificador(UUID sucursalId, String identificador);
    Optional<Mesa> findByIdentificadorQr(String identificadorQr);
    List<Mesa> findBySucursalIdOrderByIdentificadorAsc(UUID sucursalId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from Mesa m where m.id = :id")
    Optional<Mesa> lockById(@Param("id") UUID id);
}
