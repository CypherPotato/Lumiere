package com.biblioteca.backend.repository;


import com.biblioteca.backend.model.Interesse;
import com.biblioteca.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InteresseRepository extends JpaRepository<Interesse, Long> {

    boolean existsByUsuarioInteressadoAndLivroUsuario(Usuario interessado, Usuario donoDoLivro);

    List<Interesse> findByLivroUsuarioId(Long usuarios_id);

    List<Interesse> findByUsuarioInteressadoId(Long id);

    Optional<Interesse> findByLivroIdAndUsuarioInteressadoId(
            Long livroId,
            Long usuarioId);

    @Query(value = """
            SELECT COUNT_BIG(*)
            FROM interesse i
            INNER JOIN livros l ON l.id = i.livro_id
            WHERE i.status = 'ACEITO' AND l.tipo_interacao = 'TROCA'
            """, nativeQuery = true)
    long contarTrocasConcluidas();

}
