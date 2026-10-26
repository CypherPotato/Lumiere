package com.biblioteca.backend.repository;

import com.biblioteca.backend.model.Acesso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AcessoRepository extends JpaRepository<Acesso, Long> {

    List<Acesso> findByDataAcessoGreaterThanEqual(LocalDateTime dataAcesso);
}
