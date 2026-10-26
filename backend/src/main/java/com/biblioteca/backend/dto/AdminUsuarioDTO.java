package com.biblioteca.backend.dto;

import java.time.LocalDateTime;

public record AdminUsuarioDTO(
        Long id,
        String username,
        String nomeUsuario,
        String descricaoUsuario,
        String fotoUsuario,
        boolean administrador,
        LocalDateTime dataCadastro
) {}
