import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO de validación para crear una nueva publicación.
 * Se recibe como multipart/form-data junto con la imagen opcional.
 */
export class CrearPublicacionDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString()
  @MaxLength(100)
  titulo!: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  @MaxLength(500)
  descripcion!: string;

  /** ID de MongoDB del usuario autor de la publicación. */
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsString()
  usuarioId!: string;
}
