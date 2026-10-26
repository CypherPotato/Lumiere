export interface MetricaHora {
  hora: string;
  total: number;
}

export interface MetricasAdmin {
  totalUsuarios: number;
  novosUsuarios: number;
  logins24h: number;
  loginsPorHora: MetricaHora[];
  totalLivros: number;
  livrosDisponiveis: number;
  livrosSuspensos: number;
  livrosRemovidos: number;
  volumeTrocas: number;
}

export interface PessoaAdmin {
  id: number;
  username: string;
  nomeUsuario: string;
  descricaoUsuario?: string | null;
  fotoUsuario?: string | null;
  administrador: boolean;
  dataCadastro?: string | null;
}

export interface LivroAdmin {
  id: number;
  titulo: string;
  autor: string;
  descricaoLivro?: string | null;
  generoLivro?: string | null;
  tipoInteracao?: string | null;
  disponivel: boolean;
  ativo: boolean;
  usuarioId?: number | null;
  nomeUsuario?: string | null;
}

export interface PessoaForm {
  username: string;
  senha: string;
  nomeUsuario: string;
  descricaoUsuario: string;
  administrador: boolean;
}

export interface LivroForm {
  titulo: string;
  autor: string;
  descricaoLivro: string;
  generoLivro: string;
  tipoInteracao: string;
  usuarioId: number | null;
}
