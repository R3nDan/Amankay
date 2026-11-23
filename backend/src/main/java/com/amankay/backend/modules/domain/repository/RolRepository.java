package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.Rol;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RolRepository extends JpaRepository<Rol, UUID> {

    Optional<Rol> findByNombreIgnoreCase(String nombre);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Rol r where lower(r.nombre) = lower(:nombre)")
    Optional<Rol> findByNombreIgnoreCaseForUpdate(@Param("nombre") String nombre);
}
