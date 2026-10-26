export interface RelatorioAdmin {
  totalLivros: number;
  totalUsuario: number;
}

export interface EstatisticasAdmin {
  totalLivros: number;
  totalUsuario: number;
  totalInteresses: number;
  interessesPendentes: number;
}

export interface LivroAdmin {
  id: number;
  titulo: string;
  autor: string;
  descricaoLivro?: string;
  disponivel: boolean;
  ativo: boolean;
  tipoInteracao: string;
  generoLivro: string;
}

export interface UsuarioAdmin {
  id: number;
  tipoUsuario: 'ADMIN' | 'COMUM' | string;
  username: string;
  nomeUsuario: string;
  descricaoUsuario?: string;
  fotoUsuario?: string | null;
}
