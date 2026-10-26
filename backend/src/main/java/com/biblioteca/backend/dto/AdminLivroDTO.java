package com.biblioteca.backend.dto;

public record AdminLivroDTO(
        Long id,
        String titulo,
        String autor,
        String descricaoLivro,
        String generoLivro,
        String tipoInteracao,
        boolean disponivel,
        boolean ativo,
        Long usuarioId,
        String nomeUsuario
) {}
