import { Usuario } from './usuario.model';

export interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  imagenPublicId: string;
  usuario: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'nombreUsuario' | 'fotoPerfil'>;
  likes: string[];
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RespuestaPublicaciones {
  data: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}
