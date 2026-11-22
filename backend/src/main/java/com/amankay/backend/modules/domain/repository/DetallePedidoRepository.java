package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.DetallePedido;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, UUID> {

    List<DetallePedido> findByPedidoIdOrderById(UUID pedidoId);
}
