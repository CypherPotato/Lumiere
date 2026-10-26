package com.biblioteca.backend.dto;


import com.biblioteca.backend.enums.TipoUsuario;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class UsuarioDTO {

    private Long id;
    private Long usuarioId;
    private String nomeUsuario;
    private String descricaoUsuario;
    private String fotoUsuario;
    private TipoUsuario tipoUsuario;

    public UsuarioDTO(Long id, String nomeUsuario, String descricaoUsuario, String fotoUsuario, TipoUsuario tipoUsuario) {
        this.id = id;
        this.usuarioId = id;
        this.nomeUsuario = nomeUsuario;
        this.descricaoUsuario = descricaoUsuario;
        this.fotoUsuario = fotoUsuario;
        this.tipoUsuario = tipoUsuario;
    }
}