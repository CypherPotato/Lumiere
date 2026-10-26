import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { LivroAdmin, LivroForm, MetricasAdmin, PessoaAdmin, PessoaForm } from '../../core/models/admin';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  metricas = signal<MetricasAdmin | null>(null);
  pessoas = signal<PessoaAdmin[]>([]);
  livros = signal<LivroAdmin[]>([]);
  horas = 24;
  painel: 'pessoas' | 'livros' = 'pessoas';
  busca = '';
  somenteTrocas = false;
  horaSelecionada = -1;
  carregando = false;
  ocupado = false;
  erro = '';
  modal: 'pessoa' | 'livro' | null = null;
  abaPessoa: 'perfil' | 'acesso' = 'perfil';
  abaLivro: 'obra' | 'classificacao' = 'obra';
  pessoaId: number | null = null;
  pessoaForm: PessoaForm = this.pessoaVazia();
  livroForm: LivroForm = this.livroVazio();

  constructor(
    public usuarioService: UsuarioService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.usuarioService.estaAutenticado()) {
      return;
    }
    if (this.usuarioService.usuarioLogado()?.administrador) {
      this.carregar();
    }
  }

  @HostListener('document:keydown.escape')
  fecharPeloTeclado(): void {
    if (!this.ocupado) {
      this.fecharModal();
    }
  }

  carregar(): void {
    const id = this.usuarioService.obterIdUsuarioLogado();
    this.carregando = true;
    this.erro = '';
    this.adminService.metricas(id, this.horas).subscribe({
      next: (metricas) => {
        this.metricas.set(metricas);
        this.carregando = false;
      },
      error: (erro) => {
        this.erro = this.mensagem(erro);
        this.carregando = false;
      },
    });
    this.adminService.listarPessoas(id).subscribe({
      next: (pessoas) => this.pessoas.set(pessoas),
      error: (erro) => {
        this.erro = this.mensagem(erro);
      },
    });
    this.adminService.listarLivros(id).subscribe({
      next: (livros) => this.livros.set(livros),
      error: (erro) => {
        this.erro = this.mensagem(erro);
      },
    });
  }

  selecionarPeriodo(horas: number): void {
    this.horas = horas;
    const id = this.usuarioService.obterIdUsuarioLogado();
    this.adminService.metricas(id, horas).subscribe({
      next: (metricas) => this.metricas.set(metricas),
      error: (erro) => {
        this.erro = this.mensagem(erro);
      },
    });
  }

  abrirPainel(painel: 'pessoas' | 'livros', trocas = false): void {
    this.painel = painel;
    this.somenteTrocas = trocas;
    this.busca = '';
  }

  selecionarHora(indice: number): void {
    this.horaSelecionada = this.horaSelecionada === indice ? -1 : indice;
  }

  pessoasVisiveis(): PessoaAdmin[] {
    const texto = this.busca.trim().toLowerCase();
    if (!texto) {
      return this.pessoas();
    }
    return this.pessoas().filter((pessoa) =>
      `${pessoa.nomeUsuario} ${pessoa.username}`.toLowerCase().includes(texto)
    );
  }

  livrosVisiveis(): LivroAdmin[] {
    const texto = this.busca.trim().toLowerCase();
    return this.livros().filter((livro) => {
      if (this.somenteTrocas && livro.tipoInteracao !== 'TROCA') {
        return false;
      }
      if (!texto) {
        return true;
      }
      return `${livro.titulo} ${livro.autor} ${livro.nomeUsuario ?? ''}`.toLowerCase().includes(texto);
    });
  }

  abrirCriarPessoa(): void {
    this.pessoaId = null;
    this.pessoaForm = this.pessoaVazia();
    this.abaPessoa = 'perfil';
    this.modal = 'pessoa';
    this.erro = '';
  }

  abrirEditarPessoa(pessoa: PessoaAdmin): void {
    this.pessoaId = pessoa.id;
    this.pessoaForm = {
      username: pessoa.username,
      senha: '',
      nomeUsuario: pessoa.nomeUsuario,
      descricaoUsuario: pessoa.descricaoUsuario ?? '',
      administrador: pessoa.administrador,
    };
    this.abaPessoa = 'perfil';
    this.modal = 'pessoa';
    this.erro = '';
  }

  salvarPessoa(): void {
    const id = this.usuarioService.obterIdUsuarioLogado();
    this.ocupado = true;
    this.erro = '';
    const pedido = this.pessoaId
      ? this.adminService.atualizarPessoa(id, this.pessoaId, this.pessoaForm)
      : this.adminService.criarPessoa(id, this.pessoaForm);
    pedido.subscribe({
      next: () => {
        this.ocupado = false;
        this.fecharModal();
        this.carregar();
      },
      error: (erro) => {
        this.ocupado = false;
        this.erro = this.mensagem(erro);
      },
    });
  }

  abrirCriarLivro(): void {
    this.livroForm = this.livroVazio();
    this.abaLivro = 'obra';
    this.modal = 'livro';
    this.erro = '';
  }

  salvarLivro(): void {
    const id = this.usuarioService.obterIdUsuarioLogado();
    this.ocupado = true;
    this.erro = '';
    this.adminService.criarLivro(id, this.livroForm).subscribe({
      next: () => {
        this.ocupado = false;
        this.fecharModal();
        this.abrirPainel('livros');
        this.carregar();
      },
      error: (erro) => {
        this.ocupado = false;
        this.erro = this.mensagem(erro);
      },
    });
  }

  suspender(livro: LivroAdmin): void {
    this.acaoLivro(livro, 'suspender');
  }

  reativar(livro: LivroAdmin): void {
    this.acaoLivro(livro, 'reativar');
  }

  remover(livro: LivroAdmin): void {
    if (!confirm(`Remover "${livro.titulo}" do acervo?`)) {
      return;
    }
    this.acaoLivro(livro, 'remover');
  }

  restaurar(livro: LivroAdmin): void {
    this.acaoLivro(livro, 'restaurar');
  }

  fecharModal(): void {
    if (this.ocupado) {
      return;
    }
    this.modal = null;
  }

  sair(): void {
    this.usuarioService.limparUsuarioLogado();
    this.router.navigate(['/login']);
  }

  altura(total: number): number {
    const maior = Math.max(...(this.metricas()?.loginsPorHora ?? []).map((ponto) => ponto.total), 1);
    return Math.max(8, Math.round((total / maior) * 100));
  }

  pontoSelecionado() {
    return this.metricas()?.loginsPorHora?.[this.horaSelecionada];
  }

  situacao(livro: LivroAdmin): string {
    if (!livro.ativo) {
      return 'Removido';
    }
    return livro.disponivel ? 'Disponível' : 'Suspenso';
  }

  modalidade(valor?: string | null): string {
    if (valor === 'TROCA') {
      return 'Troca';
    }
    if (valor === 'DOACAO') {
      return 'Doação';
    }
    return valor || '—';
  }

  genero(valor?: string | null): string {
    const nomes: Record<string, string> = {
      Ficcao: 'Ficção',
      Cientifica: 'Científica',
      Historica: 'Histórica',
    };
    return valor ? nomes[valor] ?? valor : '—';
  }

  private acaoLivro(livro: LivroAdmin, acao: 'suspender' | 'reativar' | 'remover' | 'restaurar'): void {
    const id = this.usuarioService.obterIdUsuarioLogado();
    this.ocupado = true;
    this.erro = '';
    const pedido = acao === 'suspender'
      ? this.adminService.suspenderLivro(id, livro.id)
      : acao === 'reativar'
        ? this.adminService.reativarLivro(id, livro.id)
        : acao === 'remover'
          ? this.adminService.removerLivro(id, livro.id)
          : this.adminService.restaurarLivro(id, livro.id);
    pedido.subscribe({
      next: () => {
        this.ocupado = false;
        this.carregar();
      },
      error: (erro) => {
        this.ocupado = false;
        this.erro = this.mensagem(erro);
      },
    });
  }

  private pessoaVazia(): PessoaForm {
    return {
      username: '',
      senha: '',
      nomeUsuario: '',
      descricaoUsuario: '',
      administrador: false,
    };
  }

  private livroVazio(): LivroForm {
    return {
      titulo: '',
      autor: '',
      descricaoLivro: '',
      generoLivro: '',
      tipoInteracao: '',
      usuarioId: null,
    };
  }

  private mensagem(erro: unknown): string {
    const corpo = (erro as { error?: unknown })?.error;
    return typeof corpo === 'string' && corpo.trim()
      ? corpo
      : 'Não foi possível concluir a operação.';
  }
}
