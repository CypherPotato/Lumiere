package com.biblioteca.backend.dto;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class CadastroDto {

    private Long id;
    private String username;
    private String senha;
    private String nomeUsuario;

}
