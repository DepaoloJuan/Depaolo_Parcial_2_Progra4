import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CrearComentarioDto {
  // @IsMongoId valida que sea un string con formato de ObjectId válido de MongoDB (24 chars hex)
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
