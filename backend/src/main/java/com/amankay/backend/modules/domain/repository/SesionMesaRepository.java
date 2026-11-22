package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.SesionMesa;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SesionMesaRepository extends JpaRepository<SesionMesa, UUID> {

    Optional<SesionMesa> findByTokenSeguro(String tokenSeguro);
    List<SesionMesa> findByMesaIdAndEstado(UUID mesaId, String estado);
    List<SesionMesa> findByEstadoAndFechaAperturaBefore(String estado, java.time.Instant cutoff);
}
