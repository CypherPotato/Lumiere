import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Livro } from '../../core/models/livro';
import { DadosUsuario } from '../../core/models/dadosUsuario';
import { LivroService } from '../../core/services/livro.service';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './meu-perfil.html',
  styleUrl: './meu-perfil.css',
})
export class MeuPerfil implements OnInit {

  livros = signal<Livro[]>([]);
  perfil = signal<DadosUsuario | null>(null);

  usuarioId = 0;
  editando = false;

  dadosEdicao: DadosUsuario = {
    usuarioId: 0,
    nomeUsuario: '',
    descricaoUsuario: '',
  };

  constructor(
    private livroService: LivroService,
    public usuarioService: UsuarioService // Mudado para public para usar o getFotoUrl no HTML
  ) {}

  ngOnInit(): void {
    this.usuarioId = this.usuarioService.obterIdUsuarioLogado();
    if (this.usuarioId) {
      this.dadosPerfil();
      this.carregarLivroDoPerfil();
    }
  }

  dadosPerfil(): void {
    if (!this.usuarioId) return;
    this.usuarioService.carregarUsuarioLogado(this.usuarioId).subscribe({
      next: (usuario) => {
        console.log('USUARIO:', usuario);
        this.perfil.set(usuario);
        this.dadosEdicao = { ...usuario };
      },
      error: (erro) => {
        console.error('Erro ao buscar usuário:', erro);
      }
    });
  }

  carregarLivroDoPerfil(): void {
    if (!this.usuarioId) return;
    this.livroService.listarLivroId(this.usuarioId).subscribe({
      next: (dados) => {
        this.livros.set(dados);
      },
      error: (erro) => {
        console.error('Erro ao carregar livros:', erro);
      }
    });
  }

  iniciarEdicao(): void {
    const usuario = this.perfil();
    if (!usuario) return;
    this.dadosEdicao = { ...usuario };
    this.editando = true;
  }

  cancelarEdicao(): void {
    const usuario = this.perfil();
    if (usuario) {
      this.dadosEdicao = { ...usuario };
    }
    this.editando = false;
  }

  salvarPerfil(): void {
    this.usuarioService
      .atualizarPerfil(this.usuarioId, this.dadosEdicao)
      .subscribe({
        next: (usuarioAtualizado) => {
          console.log('Perfil atualizado:', usuarioAtualizado);
          const atualizado: DadosUsuario = {
            usuarioId: usuarioAtualizado.usuarioId ?? usuarioAtualizado.id ?? this.usuarioId,
            id: usuarioAtualizado.id ?? usuarioAtualizado.usuarioId ?? this.usuarioId,
            nomeUsuario: usuarioAtualizado.nomeUsuario,
            descricaoUsuario: usuarioAtualizado.descricaoUsuario,
            fotoUsuario: usuarioAtualizado.fotoUsuario ?? this.perfil()?.fotoUsuario
          };
          this.perfil.set(atualizado);
          this.dadosEdicao = { ...atualizado };
          this.editando = false;
        },
        error: (erro) => {
          console.error('Erro ao atualizar perfil:', erro);
        }
      });
  }

  // Escuta o upload da imagem e atualiza estado
  onFotoSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const arquivo = input.files[0];

      this.usuarioService.atualizarFoto(this.usuarioId, arquivo).subscribe({
        next: (usuarioAtualizado) => {
          console.log('Foto atualizada com sucesso:', usuarioAtualizado);
          this.perfil.set(usuarioAtualizado);
          if (this.dadosEdicao) {
            this.dadosEdicao.fotoUsuario = usuarioAtualizado.fotoUsuario;
          }
          input.value = '';
        },
        error: (erro) => {
          console.error('Erro ao enviar a foto:', erro);
          input.value = '';
        }
      });
    }
  }
}