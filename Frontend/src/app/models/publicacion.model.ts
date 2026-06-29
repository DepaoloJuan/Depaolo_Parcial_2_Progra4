import { Usuario } from './usuario.model';

/**
 * Representa una publicación tal como la devuelve la API.
 * El campo `usuario` es un subconjunto de Usuario (solo los datos necesarios
 * para mostrar en la tarjeta), poblado por Mongoose en el backend.
 */
export interface Publicacion {
  id: string;
  titulo: string;
  descripcion: string;
  /** URL pública de Cloudinary. Cadena vacía si la publicación no tiene imagen. */
  imagenUrl: string;
  /** public_id de Cloudinary, usado para eliminar la imagen desde el backend. */
  imagenPublicId: string;
  usuario: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'nombreUsuario' | 'fotoPerfil'>;
  /** Array de IDs de los usuarios que dieron like. */
  likes: string[];
  /** false = publicación eliminada (baja lógica), no visible en listados. */
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta paginada del endpoint GET /publicaciones.
 * `total` es el total de publicaciones sin paginación, usado para mostrar "cargar más".
 */
export interface RespuestaPublicaciones {
  data: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}
