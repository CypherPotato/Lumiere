import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { InteresseService } from '../../core/services/interesse.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Interesse } from '../../core/models/interesse.ts';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-interesses',
  imports: [CommonModule, RouterModule],
  templateUrl: './interesses.html',
  styleUrl: './interesses.css',
})
export class Interesses implements OnInit{

  interesses: Interesse[] = [];

  constructor(
    private interesseService: InteresseService,
    private cdr: ChangeDetectorRef,
    public usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    const idUsuario = this.usuarioService.obterIdUsuarioLogado();
    if (idUsuario) {
      this.usuarioService.carregarUsuarioLogado(idUsuario).subscribe();
    }
    this.carregarInteresses();
  }

  carregarInteresses(): void {

    const idUsuario = this.usuarioService.obterIdUsuarioLogado();
    if (!idUsuario) {
      return;
    }

    this.interesseService.listarInteressesRecebidos(idUsuario).subscribe({
    next: (dados) => {   
       dados.forEach(interesse => {
    console.log(
      "Interesse ID:", interesse.id,
      "| Livro ID:", interesse.livro.id,
      "| Status:", interesse.status
    );
  });
      this.interesses = dados;
         this.cdr.detectChanges();
    },
    error: (erro) => console.error(erro)
  });

  }
  recusar(id:number):void{
    this.interesseService.recusarInteresse(id)
      .subscribe({
        next:() => {
          this.carregarInteresses();
        },
        error:erro => console.error(erro, "Erro:  ao recusar")
      })
  }
  aceitar(id:number):void{
    this.interesseService.aceitarInteresse(id)
    .subscribe({
      next:() => {
        this.carregarInteresses();
      },
      error:erro => console.error(erro, "Erro:  ao aceitar")
    })
  }

}
