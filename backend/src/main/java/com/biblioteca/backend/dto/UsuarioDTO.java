package com.biblioteca.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {

    private Long id;
    private Long usuarioId;
    private String nomeUsuario;
    private String descricaoUsuario;
    private String fotoUsuario;
    private Boolean administrador;

    public UsuarioDTO(Long id, String nomeUsuario, String descricaoUsuario, String fotoUsuario) {
        this.id = id;
        this.usuarioId = id;
        this.nomeUsuario = nomeUsuario;
        this.descricaoUsuario = descricaoUsuario;
        this.fotoUsuario = fotoUsuario;
    }
}