package com.biblioteca.backend.dto;

public record AdminUsuarioForm(
        String username,
        String senha,
        String nomeUsuario,
        String descricaoUsuario,
        Boolean administrador
) {}
