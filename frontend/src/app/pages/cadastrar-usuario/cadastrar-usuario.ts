import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CadastroService } from '../../core/services/cadastro.service';
import { CadastroDto } from '../../core/models/cadastro';

@Component({
  selector: 'app-cadastrar-usuario',
  imports: [FormsModule],
  templateUrl: './cadastrar-usuario.html',
  styleUrl: './cadastrar-usuario.css',
})
export class CadastrarUsuario {

  nomeUsuario: string = '';
  userName: string = '';
  senha: string = '';

  constructor(
    private cadastroService: CadastroService,
    private router: Router
  ) {}

  cadastrarUsuario() {

    const dto: CadastroDto = {
      nomeUsuario: this.nomeUsuario,
      username: this.userName,
      senha: this.senha
    };

    this.cadastroService.criarUsuario(dto).subscribe({
      next: (usuario) => {
        console.log('Usuário cadastrado com sucesso', usuario);

        this.router.navigate(['/login']);
      },

      error: (erro) => {
        console.log('Erro ao cadastrar usuário', erro);
      }
    });
  }
}