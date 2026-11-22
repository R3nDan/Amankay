package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.DetalleRecepcionReposicion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleRecepcionReposicionRepository extends JpaRepository<DetalleRecepcionReposicion, UUID> {

    List<DetalleRecepcionReposicion> findByRecepcionIdOrderById(UUID recepcionId);
    List<DetalleRecepcionReposicion> findByDetalleDespachoIdOrderById(UUID detalleDespachoId);
}
