package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.Producto;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, UUID> {

    List<Producto> findByActivoTrueOrderByNombreAsc();
    List<Producto> findByActivoTrueAndCategoriaIdOrderByNombreAsc(UUID categoriaId);
}
