export interface UsuarioInteressado {
  id: number;
  username?: string;
  nomeUsuario?: string;
  descricaoUsuario?: string;
  fotoUsuario?: string | null;
}

export interface Interesse {
  id: number;
  status: string;
  livro: any;
  usuarioInteressado: UsuarioInteressado;
}