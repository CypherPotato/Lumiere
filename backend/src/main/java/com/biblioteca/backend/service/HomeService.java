package com.biblioteca.backend.service;


import com.biblioteca.backend.dto.LivroHomeDTO;
import com.biblioteca.backend.model.Livro;
import com.biblioteca.backend.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HomeService {

    @Autowired
    private LivroRepository livroRepository;

    public List<LivroHomeDTO> listarLivros(Long usuarioId) {

        List<Livro> livros = livroRepository.findByUsuarioIdNot(usuarioId);

        return livros.stream()
                .map(livro -> new LivroHomeDTO(
                        livro.getId(),
                        livro.getTitulo(),
                        livro.getAutor(),
                        livro.getDescricaoLivro(),
                        livro.getDisponivel(),
                        livro.isAtivo(),
                        livro.getTipoInteracao(),
                        livro.getGeneroLivro(),
                        livro.getUsuario() != null ? livro.getUsuario().getId() : null,
                        livro.getUsuario() != null ? livro.getUsuario().getNomeUsuario() : null,
                        livro.getUsuario() != null ? livro.getUsuario().getFotoUsuario() : null,
                        livro.getUsuario() != null ? livro.getUsuario().getDescricaoUsuario() : null
                ))
                .toList();
    }
}
