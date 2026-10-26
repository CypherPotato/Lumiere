package com.biblioteca.backend.service;

import com.biblioteca.backend.dto.AdminLivroDTO;
import com.biblioteca.backend.dto.AdminLivroForm;
import com.biblioteca.backend.dto.AdminMetricasDTO;
import com.biblioteca.backend.dto.AdminUsuarioDTO;
import com.biblioteca.backend.dto.AdminUsuarioForm;
import com.biblioteca.backend.enums.GeneroLivro;
import com.biblioteca.backend.enums.TipoInteracao;
import com.biblioteca.backend.model.Acesso;
import com.biblioteca.backend.model.Livro;
import com.biblioteca.backend.model.Usuario;
import com.biblioteca.backend.repository.AcessoRepository;
import com.biblioteca.backend.repository.InteresseRepository;
import com.biblioteca.backend.repository.LivroRepository;
import com.biblioteca.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class AdminService {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH'h'");

    private final UserRepository userRepository;
    private final LivroRepository livroRepository;
    private final InteresseRepository interesseRepository;
    private final AcessoRepository acessoRepository;
    private final LivroService livroService;

    public AdminService(
            UserRepository userRepository,
            LivroRepository livroRepository,
            InteresseRepository interesseRepository,
            AcessoRepository acessoRepository,
            LivroService livroService
    ) {
        this.userRepository = userRepository;
        this.livroRepository = livroRepository;
        this.interesseRepository = interesseRepository;
        this.acessoRepository = acessoRepository;
        this.livroService = livroService;
    }

    public AdminMetricasDTO metricas(Long administradorId, int horas) {
        exigirAdministrador(administradorId);
        if (horas != 24 && horas != 168 && horas != 720) {
            throw new RuntimeException("Período inválido.");
        }

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicioHora = agora.withMinute(0).withSecond(0).withNano(0).minusHours(23);
        List<Acesso> acessos = acessoRepository.findByDataAcessoGreaterThanEqual(inicioHora);
        long[] barras = new long[24];
        for (Acesso acesso : acessos) {
            long indice = Duration.between(inicioHora, acesso.getDataAcesso()).toHours();
            if (indice >= 0 && indice < barras.length) {
                barras[(int) indice]++;
            }
        }

        List<AdminMetricasDTO.Hora> horasLogin = new ArrayList<>();
        long logins = 0;
        for (int indice = 0; indice < barras.length; indice++) {
            logins += barras[indice];
            horasLogin.add(new AdminMetricasDTO.Hora(
                    inicioHora.plusHours(indice).format(HORA),
                    barras[indice]
            ));
        }

        return new AdminMetricasDTO(
                userRepository.count(),
                userRepository.countByDataCadastroAfter(agora.minusHours(horas)),
                logins,
                horasLogin,
                livroRepository.contarTodos(),
                livroRepository.contarDisponiveis(),
                livroRepository.contarSuspensos(),
                livroRepository.contarRemovidos(),
                interesseRepository.contarTrocasConcluidas()
        );
    }

    public List<AdminUsuarioDTO> listarUsuarios(Long administradorId) {
        exigirAdministrador(administradorId);
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(
                        usuario -> usuario.getNomeUsuario() == null ? "" : usuario.getNomeUsuario(),
                        String.CASE_INSENSITIVE_ORDER
                ))
                .map(this::paraUsuario)
                .toList();
    }

    @Transactional
    public AdminUsuarioDTO criarUsuario(Long administradorId, AdminUsuarioForm form) {
        exigirAdministrador(administradorId);
        validarIdentidade(form);
        if (form.senha() == null || form.senha().length() < 3) {
            throw new RuntimeException("A senha deve conter no mínimo 3 dígitos.");
        }
        if (userRepository.existsByUsername(form.username().trim())) {
            throw new RuntimeException("Esse nome de usuário já existe.");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(form.username().trim());
        usuario.setSenha(form.senha());
        usuario.setNomeUsuario(form.nomeUsuario().trim());
        usuario.setDescricaoUsuario(texto(form.descricaoUsuario()));
        usuario.setAdministrador(Boolean.TRUE.equals(form.administrador()));
        usuario.setDataCadastro(LocalDateTime.now());
        return paraUsuario(userRepository.save(usuario));
    }

    @Transactional
    public AdminUsuarioDTO atualizarUsuario(Long administradorId, Long id, AdminUsuarioForm form) {
        exigirAdministrador(administradorId);
        validarIdentidade(form);
        Usuario usuario = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        String username = form.username().trim();
        if (!username.equals(usuario.getUsername()) && userRepository.existsByUsername(username)) {
            throw new RuntimeException("Esse nome de usuário já existe.");
        }
        if (form.senha() != null && !form.senha().isBlank() && form.senha().length() < 3) {
            throw new RuntimeException("A senha deve conter no mínimo 3 dígitos.");
        }

        boolean eraAdministrador = Boolean.TRUE.equals(usuario.getAdministrador());
        boolean continuaAdministrador = Boolean.TRUE.equals(form.administrador());
        if (eraAdministrador && !continuaAdministrador && userRepository.countByAdministradorTrue() <= 1) {
            throw new RuntimeException("A plataforma precisa de ao menos um administrador.");
        }

        usuario.setUsername(username);
        usuario.setNomeUsuario(form.nomeUsuario().trim());
        usuario.setDescricaoUsuario(texto(form.descricaoUsuario()));
        usuario.setAdministrador(continuaAdministrador);
        if (form.senha() != null && !form.senha().isBlank()) {
            usuario.setSenha(form.senha());
        }
        return paraUsuario(userRepository.save(usuario));
    }

    public List<AdminLivroDTO> listarLivros(Long administradorId) {
        exigirAdministrador(administradorId);
        return livroRepository.listarParaAdmin().stream()
                .map(this::paraLivro)
                .toList();
    }

    @Transactional
    public Livro criarLivro(Long administradorId, AdminLivroForm form) {
        exigirAdministrador(administradorId);
        if (form.titulo() == null || form.titulo().isBlank() || form.autor() == null || form.autor().isBlank()) {
            throw new RuntimeException("Informe o título e o autor do livro.");
        }
        if (form.usuarioId() == null) {
            throw new RuntimeException("Selecione o dono do livro.");
        }

        Livro livro = new Livro();
        livro.setTitulo(form.titulo().trim());
        livro.setAutor(form.autor().trim());
        livro.setDescricaoLivro(texto(form.descricaoLivro()));
        livro.setGeneroLivro(genero(form.generoLivro()));
        livro.setTipoInteracao(tipo(form.tipoInteracao()));
        livro.setDisponivel(true);
        livro.setAtivo(true);
        return livroService.salvar(livro, form.usuarioId());
    }

    @Transactional
    public void suspenderLivro(Long administradorId, Long livroId) {
        exigirAdministrador(administradorId);
        if (livroRepository.marcarIndisponivel(livroId) == 0) {
            throw new RuntimeException("Não foi possível suspender este livro.");
        }
    }

    @Transactional
    public void reativarLivro(Long administradorId, Long livroId) {
        exigirAdministrador(administradorId);
        if (livroRepository.marcarDisponivel(livroId) == 0) {
            throw new RuntimeException("Não foi possível reativar este livro.");
        }
    }

    @Transactional
    public void removerLivro(Long administradorId, Long livroId) {
        exigirAdministrador(administradorId);
        if (livroRepository.desativar(livroId) == 0) {
            if (livroRepository.contarPorId(livroId) == 0) {
                throw new RuntimeException("Livro não encontrado.");
            }
            throw new RuntimeException("Livro já removido.");
        }
    }

    @Transactional
    public void restaurarLivro(Long administradorId, Long livroId) {
        exigirAdministrador(administradorId);
        if (livroRepository.reativarCadastro(livroId) == 0) {
            throw new RuntimeException("Não foi possível restaurar este livro.");
        }
    }

    private Usuario exigirAdministrador(Long administradorId) {
        Usuario administrador = userRepository.findById(administradorId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        if (!Boolean.TRUE.equals(administrador.getAdministrador())) {
            throw new RuntimeException("Acesso restrito a administradores.");
        }
        return administrador;
    }

    private void validarIdentidade(AdminUsuarioForm form) {
        if (form.username() == null || form.username().isBlank()
                || form.nomeUsuario() == null || form.nomeUsuario().isBlank()) {
            throw new RuntimeException("Informe o nome e o username.");
        }
    }

    private AdminUsuarioDTO paraUsuario(Usuario usuario) {
        return new AdminUsuarioDTO(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNomeUsuario(),
                usuario.getDescricaoUsuario(),
                usuario.getFotoUsuario(),
                Boolean.TRUE.equals(usuario.getAdministrador()),
                usuario.getDataCadastro()
        );
    }

    private AdminLivroDTO paraLivro(Object[] linha) {
        return new AdminLivroDTO(
                numero(linha[0]),
                texto(linha[1]),
                texto(linha[2]),
                texto(linha[3]),
                texto(linha[6]),
                texto(linha[7]),
                bit(linha[4], true),
                bit(linha[5], true),
                numero(linha[8]),
                texto(linha[9])
        );
    }

    private Long numero(Object valor) {
        if (valor == null) {
            return null;
        }
        if (valor instanceof Number numero) {
            return numero.longValue();
        }
        return Long.valueOf(valor.toString());
    }

    private boolean bit(Object valor, boolean padrao) {
        if (valor == null) {
            return padrao;
        }
        if (valor instanceof Boolean booleano) {
            return booleano;
        }
        if (valor instanceof Number numero) {
            return numero.intValue() != 0;
        }
        return Boolean.parseBoolean(valor.toString());
    }

    private String texto(Object valor) {
        if (valor == null) {
            return null;
        }
        String texto = valor.toString().trim();
        return texto.isEmpty() ? null : texto;
    }

    private GeneroLivro genero(String valor) {
        if (valor == null || valor.isBlank()) {
            throw new RuntimeException("Selecione o gênero do livro.");
        }
        try {
            return GeneroLivro.valueOf(valor);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Gênero inválido.");
        }
    }

    private TipoInteracao tipo(String valor) {
        if (valor == null || valor.isBlank()) {
            throw new RuntimeException("Selecione a modalidade do livro.");
        }
        try {
            return TipoInteracao.valueOf(valor);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Modalidade inválida.");
        }
    }
}
