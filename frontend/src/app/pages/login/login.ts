import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // 1. Importação que estava faltando
import { LoginService } from '../../core/services/login.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { LoginDto } from '../../core/models/login';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  userName: string = '';
  senha: string = '';
  erroLogin: boolean = false;
  constructor(
    private loginService: LoginService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  login() {

    this.erroLogin = false;

    const dto: LoginDto = {
      username: this.userName,
      senha: this.senha
    };

    this.loginService.criarLogin(dto).subscribe({
      next: (usuario) => {
        console.log('Usuário logado:', usuario);
        this.usuarioService.definirUsuarioLogado(usuario);
        this.router.navigate(['/home']);
      },
      error: (erro) => {
        this.erroLogin = true;
      }
    });
  }
}
