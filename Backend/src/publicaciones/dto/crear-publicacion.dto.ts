import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CrearPublicacionDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString()
  @MaxLength(100)
  titulo: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  @MaxLength(500)
  descripcion: string;

  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  @IsString()
  usuarioId: string;
}
