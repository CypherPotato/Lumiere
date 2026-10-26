package com.biblioteca.backend.dto;

public record AdminLivroForm(
        String titulo,
        String autor,
        String descricaoLivro,
        String generoLivro,
        String tipoInteracao,
        Long usuarioId
) {}
