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
  private readonly STORAGE_KEY = 'usuarioLogado';

  // Mantém os dados do usuário logado sincronizados em toda a aplicação
  usuarioLogado = signal<DadosUsuario | null>(this.obterUsuarioSalvo());

  constructor(private http: HttpClient) {}

  private obterUsuarioSalvo(): DadosUsuario | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const salvo = localStorage.getItem(this.STORAGE_KEY);
    if (!salvo) {
      return null;
    }
    try {
      return JSON.parse(salvo);
    } catch {
      return null;
    }
  }

  definirUsuarioLogado(usuario: DadosUsuario | null): void {
    if (!usuario) {
      this.usuarioLogado.set(null);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      return;
    }

    const id = usuario.id ?? usuario.usuarioId;
    const normalizado: DadosUsuario = {
      ...usuario,
      id: id,
      usuarioId: id,
    };

    this.usuarioLogado.set(normalizado);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalizado));
    }
  }

  obterIdUsuarioLogado(): number {
    return this.usuarioLogado()?.usuarioId ?? this.usuarioLogado()?.id ?? 0;
  }

  estaAutenticado(): boolean {
    return this.obterIdUsuarioLogado() > 0;
  }

  isAdministrador(): boolean {
    return this.usuarioLogado()?.tipoUsuario === 'ADMIN';
  }

  limparUsuarioLogado(): void {
    this.definirUsuarioLogado(null);
  }

  buscarDadosUsuario(usuarioId: number): Observable<DadosUsuario> {
    return this.http.get<DadosUsuario>(
      `${this.apiUrl}/${usuarioId}`
    );
  }

  carregarUsuarioLogado(usuarioId?: number): Observable<DadosUsuario> {
    const id = usuarioId ?? this.obterIdUsuarioLogado();
    return this.buscarDadosUsuario(id).pipe(
      tap((usuario) => {
        const normalizado: DadosUsuario = {
          usuarioId: usuario.usuarioId ?? usuario.id ?? id,
          id: usuario.id ?? usuario.usuarioId ?? id,
          nomeUsuario: usuario.nomeUsuario,
          descricaoUsuario: usuario.descricaoUsuario,
          fotoUsuario: usuario.fotoUsuario,
          tipoUsuario: usuario.tipoUsuario ?? this.usuarioLogado()?.tipoUsuario,
        };
        this.definirUsuarioLogado(normalizado);
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
        const id = usuarioAtualizado.usuarioId ?? usuarioAtualizado.id ?? idUsuario;
        const normalizado: DadosUsuario = {
          usuarioId: id,
          id: id,
          nomeUsuario: usuarioAtualizado.nomeUsuario,
          descricaoUsuario: usuarioAtualizado.descricaoUsuario,
          fotoUsuario: fotoAtual,
        };
        this.definirUsuarioLogado(normalizado);
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
        const id = usuarioAtualizado.usuarioId ?? usuarioAtualizado.id ?? idUsuario;
        const normalizado: DadosUsuario = {
          usuarioId: id,
          id: id,
          nomeUsuario: usuarioAtualizado.nomeUsuario,
          descricaoUsuario: usuarioAtualizado.descricaoUsuario,
          fotoUsuario: usuarioAtualizado.fotoUsuario,
        };
        this.definirUsuarioLogado(normalizado);
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