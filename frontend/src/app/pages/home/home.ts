import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LivroService } from '../../core/services/livro.service';
import { Livro } from '../../core/models/livro';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InteresseService } from '../../core/services/interesse.service'
import {CriarInteresse} from'../../core/models/criarInteresse';
import { HomeService } from '../../core/services/home.service';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  livros = signal<Livro[]>([]);
  textoBusca = '';
  matchIds = signal<Set<number>>(new Set());
  generoSelecionado: string = '';

  constructor(
    private livroService: LivroService,
    private interesseService: InteresseService,
    private homeService: HomeService,
    public usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    const idUsuario = this.usuarioService.obterIdUsuarioLogado();
    if (idUsuario) {
      this.usuarioService.carregarUsuarioLogado(idUsuario).subscribe();
    }
    this.carregarLivros(idUsuario);
    this.carregarMeusInteresses(idUsuario);
  }

  carregarMeusInteresses(idUsuario?: number): void {
    const id = idUsuario ?? this.usuarioService.obterIdUsuarioLogado();
    if (!id) return;

    this.interesseService.listarInteressesEnviados(id)
      .subscribe({
        next: (interesses) => {
          console.log('Interesses recebidos:', interesses);

          const ids = interesses
            .filter(i => i.status === 'PENDENTE'  && i.livro != null)
            .map(i => i.livro.id);

          this.matchIds.set(new Set(ids));
        },
        error: (erro) => {
          console.error(erro);
        }
      });
  }

  carregarLivros(idUsuario?: number): void {
    const id = idUsuario ?? this.usuarioService.obterIdUsuarioLogado();
    if (!id) return;

    this.homeService.listarTodos(id).subscribe({
      next: (dados) => {
        this.livros.set(dados);
        console.log("Dados:", dados)
      },
      error: (erro) => {
        console.error(erro);
      }
    });
  }

buscarLivroTexto():void{
  if(!this.textoBusca.trim()){
    this.carregarLivros();
    return;
  }
  this.livroService.buscarDadosLivro(this.textoBusca).subscribe({
    next:(dados) =>{
      this.livros.set(dados);
    },
    error:(erro)=> {
      console.error('Erro ao buscar livro:', erro);
    }
  })
}

buscarLivroGenero(): void {

  if (!this.generoSelecionado.trim()) {
    this.carregarLivros();
    return;
  }

  this.livroService.buscarDadosLivro(this.generoSelecionado)
    .subscribe({
      next: dados => {
        this.livros.set(dados);
      },
      error: erro => console.error(erro)
    });
}

  temMatch(id: number): boolean {
    return this.matchIds().has(id);
  }


demonstrarInteresse(livro: Livro): void {
  const idUsuario = this.usuarioService.obterIdUsuarioLogado();
  if (!idUsuario) {
    console.error('Usuário não autenticado');
    return;
  }

  if (this.temMatch(livro.id)) {

      this.interesseService.cancelarInteresse(livro.id, idUsuario)
      .subscribe(() => {

          const matches = new Set(this.matchIds());
          matches.delete(livro.id);
          this.matchIds.set(matches);

      });

      return;
  }

  const interesse: CriarInteresse = {
    livro: { id: livro.id },
    usuarioInteressado: { id: idUsuario }
  };

  this.interesseService.criarInteresse(interesse)
  .subscribe(() => {

      const matches = new Set(this.matchIds());
      matches.add(livro.id);
      this.matchIds.set(matches);

  });

}

}