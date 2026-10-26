package com.biblioteca.backend.admin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.biblioteca.backend.admin.service.AdminService;
import com.biblioteca.backend.model.Livro;
import com.biblioteca.backend.model.Usuario;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/relatorios")
    public Map<String, Long> obterRelatorio() {
        return adminService.obterRelatorios();
    }

    @DeleteMapping("/livros/{id}")
    public void excluirLivro(@PathVariable long id) {
        adminService.excluirLivro(id);
    }

    @GetMapping("/livros")
    public List<Livro> listarLivros() {
        return adminService.listarLivros();
    }

    @GetMapping("/usuarios")
    public List<Usuario> listarUsuarios() {
        return adminService.listarUsuario();
    }

    @GetMapping("/relatorios/interesses")
    public long contarInteresses() {
        return adminService.contarInteresses();
    }

    @GetMapping("/relatorios/interesses/pendentes")
    public long contarInteressesPendentes() {
        return adminService.contarInteressesPendentes();
    }
}
