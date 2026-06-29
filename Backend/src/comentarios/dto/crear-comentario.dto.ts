import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CrearComentarioDto {
  @IsMongoId()
  @IsNotEmpty()
  publicacionId!: string;

  @IsMongoId()
  @IsNotEmpty()
  usuarioId!: string;

  @IsString()
  @IsNotEmpty()
  mensaje!: string;
}
