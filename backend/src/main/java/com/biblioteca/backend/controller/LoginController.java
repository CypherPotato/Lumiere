package com.biblioteca.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.biblioteca.backend.dto.LoginDto;
import com.biblioteca.backend.dto.UsuarioDTO;
import com.biblioteca.backend.service.LoginService;

@RestController
@RequestMapping("/login")
@CrossOrigin(origins = "http://localhost:4200")
public class LoginController {
    @Autowired 
    private LoginService loginService;

    @PostMapping 
    public UsuarioDTO fazerLogin(@RequestBody LoginDto loginDto){
        return loginService.fazerLogin(loginDto);
    }
    
}
