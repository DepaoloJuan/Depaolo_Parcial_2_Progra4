import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

/**
 * usuarioId NO está en el DTO — viene del token JWT y el controller lo pasa
 * al service como parámetro separado, nunca del body del cliente.
 */
export class CrearComentarioDto {
  // @IsMongoId valida que sea un string con formato de ObjectId válido de MongoDB (24 chars hex)
  @IsMongoId()
  @IsNotEmpty()
  publicacionId!: string;

  @IsString()
  @IsNotEmpty()
  mensaje!: string;
}
