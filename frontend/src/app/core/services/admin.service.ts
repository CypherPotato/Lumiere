import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { EstatisticasAdmin, LivroAdmin, RelatorioAdmin, UsuarioAdmin } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8081/admin';

  constructor(private http: HttpClient) {}

  obterRelatorios(): Observable<RelatorioAdmin> {
    return this.http.get<RelatorioAdmin>(`${this.apiUrl}/relatorios`);
  }

  contarInteresses(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/relatorios/interesses`);
  }

  contarInteressesPendentes(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/relatorios/interesses/pendentes`);
  }

  listarLivros(): Observable<LivroAdmin[]> {
    return this.http.get<LivroAdmin[]>(`${this.apiUrl}/livros`);
  }

  excluirLivro(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/livros/${id}`, { responseType: 'text' });
  }

  listarUsuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(`${this.apiUrl}/usuarios`);
  }

  obterEstatisticasCompletas(): Observable<EstatisticasAdmin> {
    return forkJoin({
      relatorio: this.obterRelatorios(),
      interesses: this.contarInteresses(),
      pendentes: this.contarInteressesPendentes()
    }).pipe(
      map(({ relatorio, interesses, pendentes }) => ({
        totalLivros: relatorio.totalLivros ?? 0,
        totalUsuario: relatorio.totalUsuario ?? 0,
        totalInteresses: interesses ?? 0,
        interessesPendentes: pendentes ?? 0
      }))
    );
  }
}
