import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CrearComentarioDto {
  // @IsMongoId valida que sea un string con formato de ObjectId válido de MongoDB (24 chars hex)
  @IsMongoId()
  @IsNotEmpty()
  publicacionId!: string;

  /**
   * No se valida ni se espera del cliente — el controller lo inyecta desde el token JWT
   * usando @UsuarioActual('usuarioId'). Cualquier valor enviado en el body es descartado.
   */
  usuarioId?: string;

  @IsString()
  @IsNotEmpty()
  mensaje!: string;
}
