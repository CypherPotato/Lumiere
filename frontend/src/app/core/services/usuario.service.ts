import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DadosUsuario } from '../models/dadosUsuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private apiUrl = 'http://localhost:8081/usuarios';
  private baseUrl = 'http://localhost:8081';

  // Mantém os dados do usuário logado sincronizados em toda a aplicação
  usuarioLogado = signal<DadosUsuario | null>(null);

  constructor(private http: HttpClient) {}

  buscarDadosUsuario(usuarioId: number): Observable<DadosUsuario> {
    return this.http.get<DadosUsuario>(
      `${this.apiUrl}/${usuarioId}`
    );
  }

  carregarUsuarioLogado(usuarioId: number = 1): Observable<DadosUsuario> {
    return this.buscarDadosUsuario(usuarioId).pipe(
      tap((usuario) => {
        const normalizado: DadosUsuario = {
          usuarioId: usuario.usuarioId ?? usuario.id ?? usuarioId,
          id: usuario.id ?? usuario.usuarioId ?? usuarioId,
          nomeUsuario: usuario.nomeUsuario,
          descricaoUsuario: usuario.descricaoUsuario,
          fotoUsuario: usuario.fotoUsuario,
        };
        this.usuarioLogado.set(normalizado);
      })
    );
  }

  atualizarPerfil(
    idUsuario: number,
    usuario: DadosUsuario
  ): Observable<DadosUsuario> {
    return this.http.put<DadosUsuario>(
      `${this.apiUrl}/${idUsuario}`,
      usuario
    ).pipe(
      tap((usuarioAtualizado) => {
        const fotoAtual = usuarioAtualizado.fotoUsuario ?? this.usuarioLogado()?.fotoUsuario;
        const normalizado: DadosUsuario = {
          usuarioId: usuarioAtualizado.usuarioId ?? usuarioAtualizado.id ?? idUsuario,
          id: usuarioAtualizado.id ?? usuarioAtualizado.usuarioId ?? idUsuario,
          nomeUsuario: usuarioAtualizado.nomeUsuario,
          descricaoUsuario: usuarioAtualizado.descricaoUsuario,
          fotoUsuario: fotoAtual,
        };
        this.usuarioLogado.set(normalizado);
      })
    );
  }

  atualizarFoto(
    idUsuario: number,
    foto: File
  ): Observable<DadosUsuario> {
    const formData = new FormData();
    formData.append('foto', foto);

    return this.http.put<DadosUsuario>(
      `${this.apiUrl}/${idUsuario}/foto`,
      formData
    ).pipe(
      tap((usuarioAtualizado) => {
        const normalizado: DadosUsuario = {
          usuarioId: usuarioAtualizado.usuarioId ?? usuarioAtualizado.id ?? idUsuario,
          id: usuarioAtualizado.id ?? usuarioAtualizado.usuarioId ?? idUsuario,
          nomeUsuario: usuarioAtualizado.nomeUsuario,
          descricaoUsuario: usuarioAtualizado.descricaoUsuario,
          fotoUsuario: usuarioAtualizado.fotoUsuario,
        };
        this.usuarioLogado.set(normalizado);
      })
    );
  }

  // Gera a URL de exibição ou retorna avatar com iniciais/padrão
  getFotoUrl(nomeFoto?: string | null, nomeFallback?: string | null): string {
    if (
      nomeFoto &&
      typeof nomeFoto === 'string' &&
      nomeFoto.trim() !== '' &&
      nomeFoto !== 'null' &&
      nomeFoto !== 'undefined'
    ) {
      if (
        nomeFoto.startsWith('http://') ||
        nomeFoto.startsWith('https://') ||
        nomeFoto.startsWith('data:')
      ) {
        return nomeFoto;
      }
      if (nomeFoto.startsWith('/uploads/')) {
        return `${this.baseUrl}${nomeFoto}`;
      }
      if (nomeFoto.startsWith('uploads/')) {
        return `${this.baseUrl}/${nomeFoto}`;
      }
      return `${this.baseUrl}/uploads/usuarios/${nomeFoto}`;
    }

    if (nomeFallback && typeof nomeFallback === 'string' && nomeFallback.trim() !== '') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeFallback.trim())}&background=4F46E5&color=fff&size=200`;
    }

    return 'assets/images/default-avatar.svg';
  }
}