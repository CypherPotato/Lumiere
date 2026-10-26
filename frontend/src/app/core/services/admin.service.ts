import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LivroAdmin, MetricasAdmin, PessoaAdmin, LivroForm, PessoaForm } from '../models/admin';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:8081/admin';

  constructor(private http: HttpClient) {}

  metricas(administradorId: number, horas: number) {
    return this.http.get<MetricasAdmin>(`${this.apiUrl}/${administradorId}/metricas`, {
      params: { horas },
    });
  }

  listarPessoas(administradorId: number) {
    return this.http.get<PessoaAdmin[]>(`${this.apiUrl}/${administradorId}/usuarios`);
  }

  criarPessoa(administradorId: number, form: PessoaForm) {
    return this.http.post<PessoaAdmin>(`${this.apiUrl}/${administradorId}/usuarios`, form);
  }

  atualizarPessoa(administradorId: number, id: number, form: PessoaForm) {
    return this.http.put<PessoaAdmin>(`${this.apiUrl}/${administradorId}/usuarios/${id}`, form);
  }

  listarLivros(administradorId: number) {
    return this.http.get<LivroAdmin[]>(`${this.apiUrl}/${administradorId}/livros`);
  }

  criarLivro(administradorId: number, form: LivroForm) {
    return this.http.post<void>(`${this.apiUrl}/${administradorId}/livros`, form);
  }

  suspenderLivro(administradorId: number, id: number) {
    return this.http.patch<void>(`${this.apiUrl}/${administradorId}/livros/${id}/suspender`, {});
  }

  reativarLivro(administradorId: number, id: number) {
    return this.http.patch<void>(`${this.apiUrl}/${administradorId}/livros/${id}/reativar`, {});
  }

  removerLivro(administradorId: number, id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${administradorId}/livros/${id}`);
  }

  restaurarLivro(administradorId: number, id: number) {
    return this.http.patch<void>(`${this.apiUrl}/${administradorId}/livros/${id}/restaurar`, {});
  }
}
