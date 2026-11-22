package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.Pedido;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    Optional<Pedido> findByCodigoSeguimiento(String codigoSeguimiento);
    List<Pedido> findByEstadoOrderByFechaCreacionAsc(String estado);
    List<Pedido> findByEstadoAndFechaVencimientoBefore(String estado, Instant fechaVencimiento);
    List<Pedido> findBySucursalIdAndEstadoOrderByFechaCreacionAsc(UUID sucursalId, String estado);
    List<Pedido> findBySucursalIdIsNullAndEstadoOrderByFechaCreacionAsc(String estado);
    List<Pedido> findByCuentaMesaId(UUID cuentaMesaId);
    List<Pedido> findBySucursalIdAndFechaCreacionBetweenOrderByFechaCreacionDesc(UUID sucursalId, Instant desde, Instant hasta);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pedido p where p.id = :id")
    Optional<Pedido> lockById(@Param("id") UUID id);
}
