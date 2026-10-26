package com.biblioteca.backend.repository;


import com.biblioteca.backend.enums.GeneroLivro;
import com.biblioteca.backend.model.Livro;
import com.biblioteca.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;



    @Repository
    public interface LivroRepository extends JpaRepository<Livro, Long> {

        List<Livro> findByUsuario(Usuario usuario);

        List<Livro>findByTituloContainingIgnoreCase(String titulo);

        List<Livro>findByAutorContainingIgnoreCase(String autor);

        List<Livro>findByGeneroLivro(GeneroLivro generoLivro);

        List<Livro> findByUsuarioIdNot(Long usuarioId);

        @Query(value = "SELECT COUNT_BIG(*) FROM livros", nativeQuery = true)
        long contarTodos();

        @Query(value = "SELECT COUNT_BIG(*) FROM livros WHERE ativo = 1 AND (disponivel = 1 OR disponivel IS NULL)", nativeQuery = true)
        long contarDisponiveis();

        @Query(value = "SELECT COUNT_BIG(*) FROM livros WHERE ativo = 1 AND disponivel = 0", nativeQuery = true)
        long contarSuspensos();

        @Query(value = "SELECT COUNT_BIG(*) FROM livros WHERE ativo = 0", nativeQuery = true)
        long contarRemovidos();

        @Query(value = "SELECT COUNT_BIG(*) FROM livros WHERE id = :id", nativeQuery = true)
        long contarPorId(@Param("id") Long id);

        @Query(value = """
                SELECT l.id, l.titulo, l.autor, l.descricao_livro, l.disponivel, l.ativo,
                       l.genero_livro, l.tipo_interacao, u.id, u.nome_usuario
                FROM livros l
                LEFT JOIN usuarios u ON u.id = l.usuario_id
                ORDER BY l.id DESC
                """, nativeQuery = true)
        List<Object[]> listarParaAdmin();

        @Modifying(clearAutomatically = true)
        @Query(value = "UPDATE livros SET disponivel = 0 WHERE id = :id AND ativo = 1", nativeQuery = true)
        int marcarIndisponivel(@Param("id") Long id);

        @Modifying(clearAutomatically = true)
        @Query(value = "UPDATE livros SET disponivel = 1 WHERE id = :id AND ativo = 1", nativeQuery = true)
        int marcarDisponivel(@Param("id") Long id);

        @Modifying(clearAutomatically = true)
        @Query(value = "UPDATE livros SET ativo = 0 WHERE id = :id AND ativo = 1", nativeQuery = true)
        int desativar(@Param("id") Long id);

        @Modifying(clearAutomatically = true)
        @Query(value = "UPDATE livros SET ativo = 1 WHERE id = :id AND ativo = 0", nativeQuery = true)
        int reativarCadastro(@Param("id") Long id);
    }
