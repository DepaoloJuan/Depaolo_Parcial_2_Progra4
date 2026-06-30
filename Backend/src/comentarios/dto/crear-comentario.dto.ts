import { IsNotEmpty, IsOptional, IsString, IsMongoId } from 'class-validator';

export class CrearComentarioDto {
  // @IsMongoId valida que sea un string con formato de ObjectId válido de MongoDB (24 chars hex)
  @IsMongoId()
  @IsNotEmpty()
  publicacionId!: string;

  /**
   * @IsOptional lo mantiene en la whitelist del ValidationPipe para que no rechace
   * el campo si el frontend lo sigue mandando. El controller lo sobreescribe desde el token.
   */
  @IsOptional()
  @IsMongoId()
  usuarioId?: string;

  @IsString()
  @IsNotEmpty()
  mensaje!: string;
}
