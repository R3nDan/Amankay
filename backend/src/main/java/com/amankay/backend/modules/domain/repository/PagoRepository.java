package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.Pago;
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
public interface PagoRepository extends JpaRepository<Pago, UUID> {

    List<Pago> findByPedidoIdOrderByFechaCreacionDesc(UUID pedidoId);
    List<Pago> findByCuentaMesaIdOrderByFechaCreacionDesc(UUID cuentaMesaId);
    boolean existsByPedidoIdAndEstadoIn(UUID pedidoId, java.util.Collection<String> estados);
    boolean existsByCuentaMesaIdAndEstadoIn(UUID cuentaMesaId, java.util.Collection<String> estados);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pago p where p.id = :id")
    Optional<Pago> lockById(@Param("id") UUID id);
}
