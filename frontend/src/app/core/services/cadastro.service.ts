import { HttpClient } from "@angular/common/http";
import { CadastroDto } from "../models/cadastro";
import { DadosUsuario } from "../models/dadosUsuario";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class CadastroService {

  private apiUrl = 'http://localhost:8081/cadastro';

  constructor(private http: HttpClient) {}

  criarUsuario(dto: CadastroDto): Observable<DadosUsuario> {
    return this.http.post<DadosUsuario>(this.apiUrl, dto);
  }
}