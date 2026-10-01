import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CadastroLivro } from '../meus-livros/cadastro-livro/cadastro-livro';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-chat-component',
    imports: [CommonModule,FormsModule, RouterModule, CadastroLivro],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css',
})
export class ChatComponent {

  
constructor(
  public usuarioService: UsuarioService
) {}
}
