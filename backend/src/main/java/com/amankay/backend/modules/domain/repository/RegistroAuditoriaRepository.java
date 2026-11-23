package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.RegistroAuditoria;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistroAuditoriaRepository extends JpaRepository<RegistroAuditoria, UUID> {

    List<RegistroAuditoria> findByFechaHoraBetweenOrderByFechaHoraDesc(Instant desde, Instant hasta);
    List<RegistroAuditoria> findByEntidadAndEntidadIdOrderByFechaHoraAsc(String entidad, UUID entidadId);
    List<RegistroAuditoria> findByEntidadAndOperacionAndFechaHoraBetweenOrderByFechaHoraDesc(
            String entidad, String operacion, Instant desde, Instant hasta);
}
