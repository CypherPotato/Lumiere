import { Injectable } from "@angular/core";
import { DadosUsuario } from "../models/dadosUsuario";
import { Observable, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { LoginDto } from "../models/login";
import { UsuarioService } from "./usuario.service";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:8081/login';
  interesses$: any;

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService
  ) {}

  criarLogin(dto: LoginDto): Observable<DadosUsuario> {
    return this.http.post<DadosUsuario>(this.apiUrl, dto).pipe(
      tap((usuario) => {
        this.usuarioService.definirUsuarioLogado(usuario);
      })
    );
  }
}
