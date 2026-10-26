package com.biblioteca.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.biblioteca.backend.dto.LoginDto;
import com.biblioteca.backend.dto.UsuarioDTO;
import com.biblioteca.backend.model.Usuario;
import com.biblioteca.backend.repository.UserRepository;

@Service
public class LoginService {

    @Autowired
    private UserRepository userRepository;

public UsuarioDTO fazerLogin(LoginDto loginDto) {

    Usuario usuario = userRepository
            .findByUsername(loginDto.getUsername())
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuário ou senha inválidos"
            ));

    if (!usuario.getSenha().equals(loginDto.getSenha())) {
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Usuário ou senha inválidos"
        );
    }

    return new UsuarioDTO(
            usuario.getId(),
            usuario.getNomeUsuario(),
            usuario.getDescricaoUsuario(),
            usuario.getFotoUsuario(),
            usuario.getTipoUsuario()
    );
}
}