package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.Entrega;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EntregaRepository extends JpaRepository<Entrega, UUID> {

    Optional<Entrega> findByPedidoId(UUID pedidoId);
    List<Entrega> findByRepartidorIdOrderByFechaCreacionDesc(UUID repartidorId);
    List<Entrega> findByEstadoOrderByFechaCreacionAsc(String estado);

    @Query("select d from Entrega d, Pedido p where p.id = d.pedidoId and p.sucursalId = :sucursalId order by d.fechaCreacion desc")
    List<Entrega> findBySucursalId(@Param("sucursalId") UUID sucursalId);
}
