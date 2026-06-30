import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO de validación para crear una nueva publicación.
 * Se recibe como multipart/form-data junto con la imagen opcional.
 * usuarioId NO está en el DTO — viene del token JWT y el controller lo pasa
 * al service como parámetro separado, nunca del body del cliente.
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
}
