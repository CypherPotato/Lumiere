package com.biblioteca.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CadastroDto {

    private Long id;
    private String username;
    private String senha;
    private String nomeUsuario;

}
