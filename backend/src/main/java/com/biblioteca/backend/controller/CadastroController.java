package com.biblioteca.backend.controller;

import com.biblioteca.backend.dto.CadastroDto;
import com.biblioteca.backend.dto.UsuarioDTO;
import com.biblioteca.backend.service.CadastroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cadastro")
@CrossOrigin(origins = "http://localhost:4200")
public class CadastroController {

    @Autowired
    private CadastroService cadastroService;

    @PostMapping
    public UsuarioDTO criarCadastro(@RequestBody CadastroDto dto) {
        return cadastroService.criarCadastro(dto);
    }
}