package com.biblioteca.backend.dto;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class LoginDto {
    private String username;
    private String senha;
}
