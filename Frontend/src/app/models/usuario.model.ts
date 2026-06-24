/**
 * Representa un usuario de la red social tal como lo devuelve la API.
 * Refleja el schema de Mongoose pero sin _id ni contraseña.
 */
export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  /** Fecha en formato ISO 8601, ej: "2000-05-20T00:00:00.000Z". */
  fechaNacimiento: string;
  descripcion: string;
  /** URL pública de Cloudinary. Cadena vacía si no cargó foto de perfil. */
  fotoPerfil: string;
  perfil: 'usuario' | 'administrador';
  /** false indica cuenta deshabilitada (baja lógica). */
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
