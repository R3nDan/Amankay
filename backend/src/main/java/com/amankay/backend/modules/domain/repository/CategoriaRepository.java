package com.amankay.backend.modules.domain.repository;

import com.amankay.backend.modules.domain.model.Categoria;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {

    List<Categoria> findByActivaTrueOrderByNombreAsc();
}
