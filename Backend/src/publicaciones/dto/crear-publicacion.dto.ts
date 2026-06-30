import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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

  /**
   * @IsOptional lo mantiene en la whitelist del ValidationPipe para que no rechace
   * el campo si el frontend lo sigue mandando. El controller lo sobreescribe desde el token.
   */
  @IsOptional()
  @IsString()
  usuarioId?: string;
}
