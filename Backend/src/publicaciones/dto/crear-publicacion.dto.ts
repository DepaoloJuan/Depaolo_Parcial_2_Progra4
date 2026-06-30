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

  /**
   * No se valida ni se espera del cliente — el controller lo inyecta desde el token JWT
   * usando @UsuarioActual('usuarioId'). Cualquier valor enviado en el body es descartado.
   */
  usuarioId?: string;
}
