package com.biblioteca.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.biblioteca.backend.dto.CadastroDto;
import com.biblioteca.backend.dto.UsuarioDTO;
import com.biblioteca.backend.model.Usuario;
import com.biblioteca.backend.repository.UserRepository;

import java.time.LocalDateTime;

@Service 
public class CadastroService {
    
    @Autowired 
    private UserRepository userRepository;


    public UsuarioDTO criarCadastro( CadastroDto dto){

        if(dto.getSenha() == null || dto.getSenha().length()<3){
            throw new RuntimeException("A senha deve conter no minimo 3 digitos");
        }
        if(userRepository.existsByUsername(dto.getUsername())){
             throw new RuntimeException("Esse nome de usuário já existe");
        }

        Usuario usuario = new Usuario();

        usuario.setUsername(dto.getUsername());
        usuario.setSenha(dto.getSenha());
        usuario.setNomeUsuario(dto.getNomeUsuario());
        usuario.setDataCadastro(LocalDateTime.now());

         Usuario usuarioSalvo = userRepository.save(usuario);

         
    return new UsuarioDTO(
        usuarioSalvo.getId(),
        usuarioSalvo.getNomeUsuario(),
        usuarioSalvo.getDescricaoUsuario(),
        usuarioSalvo.getFotoUsuario()
    );
      
    }
    
}
