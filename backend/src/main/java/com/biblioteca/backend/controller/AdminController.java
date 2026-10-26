package com.biblioteca.backend.controller;

import com.biblioteca.backend.dto.AdminLivroForm;
import com.biblioteca.backend.dto.AdminMetricasDTO;
import com.biblioteca.backend.dto.AdminUsuarioDTO;
import com.biblioteca.backend.dto.AdminUsuarioForm;
import com.biblioteca.backend.dto.AdminLivroDTO;
import com.biblioteca.backend.service.AdminService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/{administradorId}/metricas")
    public AdminMetricasDTO metricas(
            @PathVariable Long administradorId,
            @RequestParam(defaultValue = "24") int horas
    ) {
        return adminService.metricas(administradorId, horas);
    }

    @GetMapping("/{administradorId}/usuarios")
    public List<AdminUsuarioDTO> listarUsuarios(@PathVariable Long administradorId) {
        return adminService.listarUsuarios(administradorId);
    }

    @PostMapping("/{administradorId}/usuarios")
    public AdminUsuarioDTO criarUsuario(
            @PathVariable Long administradorId,
            @RequestBody AdminUsuarioForm form
    ) {
        return adminService.criarUsuario(administradorId, form);
    }

    @PutMapping("/{administradorId}/usuarios/{id}")
    public AdminUsuarioDTO atualizarUsuario(
            @PathVariable Long administradorId,
            @PathVariable Long id,
            @RequestBody AdminUsuarioForm form
    ) {
        return adminService.atualizarUsuario(administradorId, id, form);
    }

    @GetMapping("/{administradorId}/livros")
    public List<AdminLivroDTO> listarLivros(@PathVariable Long administradorId) {
        return adminService.listarLivros(administradorId);
    }

    @PostMapping("/{administradorId}/livros")
    public void criarLivro(
            @PathVariable Long administradorId,
            @RequestBody AdminLivroForm form
    ) {
        adminService.criarLivro(administradorId, form);
    }

    @PatchMapping("/{administradorId}/livros/{id}/suspender")
    public void suspenderLivro(@PathVariable Long administradorId, @PathVariable Long id) {
        adminService.suspenderLivro(administradorId, id);
    }

    @PatchMapping("/{administradorId}/livros/{id}/reativar")
    public void reativarLivro(@PathVariable Long administradorId, @PathVariable Long id) {
        adminService.reativarLivro(administradorId, id);
    }

    @DeleteMapping("/{administradorId}/livros/{id}")
    public void removerLivro(@PathVariable Long administradorId, @PathVariable Long id) {
        adminService.removerLivro(administradorId, id);
    }

    @PatchMapping("/{administradorId}/livros/{id}/restaurar")
    public void restaurarLivro(@PathVariable Long administradorId, @PathVariable Long id) {
        adminService.restaurarLivro(administradorId, id);
    }
}
