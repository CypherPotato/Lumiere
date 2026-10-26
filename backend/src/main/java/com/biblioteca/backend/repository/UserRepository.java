package com.biblioteca.backend.repository;

import com.biblioteca.backend.model.Usuario;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<Usuario, Long> {

     boolean existsByUsername(String username);

     Optional<Usuario> findByUsername(String username);

     long countByAdministradorTrue();

     long countByDataCadastroAfter(LocalDateTime dataCadastro);
}