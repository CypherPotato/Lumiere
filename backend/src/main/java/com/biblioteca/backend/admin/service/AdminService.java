package com.biblioteca.backend.admin.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.biblioteca.backend.enums.StatusInteresse;
import com.biblioteca.backend.enums.TipoUsuario;
import com.biblioteca.backend.model.Livro;
import com.biblioteca.backend.model.Usuario;
import com.biblioteca.backend.repository.InteresseRepository;
import com.biblioteca.backend.repository.LivroRepository;
import com.biblioteca.backend.repository.UserRepository;

@Service
public class AdminService {

    @Autowired
    private LivroRepository livroRepository;

    @Autowired
    private UserRepository usuarioRepository;

    @Autowired
    private InteresseRepository interesseRepository;

    public AdminService(
            LivroRepository livroRepository,
            UserRepository usuarioRepository) {
        this.livroRepository = livroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Map<String, Long> obterRelatorios() {
        return Map.of(
                "totalLivros", livroRepository.count(),
                "totalUsuario", usuarioRepository.count());
    }

    public void excluirLivro(Long id) {
        if (!livroRepository.existsById(id)) {
            throw new RuntimeException("Livro não encontrado.");
        }

        livroRepository.deleteById(id);
    }

    public List<Livro> listarLivros() {
        return livroRepository.findAll();
    }

    public List<Usuario> listarUsuario() {
        return usuarioRepository.findAll();
    }

    public void verificarAdministrador(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"));

        if (usuario.getTipoUsuario() != TipoUsuario.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso permitido apenas para administradores");
        }
    }

    public long contarInteresses() {
        return interesseRepository.count();
    }

    public long contarInteressesPendentes() {
        return interesseRepository.countByStatus(StatusInteresse.PENDENTE);
    }
}
