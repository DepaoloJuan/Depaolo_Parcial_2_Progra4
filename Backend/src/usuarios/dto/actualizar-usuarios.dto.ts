import { IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';

/**
 * DTO para actualizar el perfil de un usuario existente.
 * Todos los campos son opcionales: solo se actualizan los que vienen en el body.
 * El correo y el nombreUsuario no son editables por diseño.
 */
export class ActualizarUsuarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  /** Formato ISO 8601, ej: "1995-11-30". */
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;
}
