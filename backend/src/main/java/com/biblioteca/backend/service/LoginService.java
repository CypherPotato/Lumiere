package com.biblioteca.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.biblioteca.backend.dto.LoginDto;
import com.biblioteca.backend.dto.UsuarioDTO;
import com.biblioteca.backend.model.Acesso;
import com.biblioteca.backend.model.Usuario;
import com.biblioteca.backend.repository.AcessoRepository;
import com.biblioteca.backend.repository.UserRepository;

import java.time.LocalDateTime;

@Service
public class LoginService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AcessoRepository acessoRepository;

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

    if (!Boolean.TRUE.equals(usuario.getAdministrador()) && userRepository.countByAdministradorTrue() == 0) {
        usuario.setAdministrador(true);
        userRepository.save(usuario);
    }

    Acesso acesso = new Acesso();
    acesso.setUsuario(usuario);
    acesso.setDataAcesso(LocalDateTime.now());
    acessoRepository.save(acesso);

    UsuarioDTO resposta = new UsuarioDTO(
            usuario.getId(),
            usuario.getNomeUsuario(),
            usuario.getDescricaoUsuario(),
            usuario.getFotoUsuario()
    );
    resposta.setAdministrador(Boolean.TRUE.equals(usuario.getAdministrador()));
    return resposta;
}
}