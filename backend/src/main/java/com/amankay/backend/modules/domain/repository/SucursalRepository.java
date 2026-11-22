package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.Sucursal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SucursalRepository extends JpaRepository<Sucursal, UUID> {

    List<Sucursal> findByActivaTrue();
    List<Sucursal> findByActivaTrueOrderByNombreAsc();
}
