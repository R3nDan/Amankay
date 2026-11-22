package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.HorarioSucursal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HorarioSucursalRepository extends JpaRepository<HorarioSucursal, UUID> {

    List<HorarioSucursal> findBySucursalIdOrderByDiaSemanaAsc(UUID sucursalId);
}
