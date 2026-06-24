import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsDateString,
  IsOptional,
  Matches,
  IsIn,
} from 'class-validator';

/**
 * DTO de validación para el registro de un nuevo usuario.
 * El ValidationPipe global rechaza con 400 cualquier campo que no pase estas reglas.
 */
export class CrearUsuarioDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(50)
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  @MaxLength(50)
  apellido!: string;

  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  correo!: string;

  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  nombreUsuario!: string;

  /**
   * La contraseña debe cumplir tres reglas:
   *   - Al menos 8 caracteres
   *   - Al menos una letra mayúscula  (?=.*[A-Z])
   *   - Al menos un dígito            (?=.*\d)
   * El hash se genera en UsuariosService antes de persistir.
   */
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'La contraseña debe tener al menos una mayúscula',
  })
  @Matches(/(?=.*\d)/, {
    message: 'La contraseña debe tener al menos un número',
  })
  contrasenia!: string;

  /** Formato ISO 8601, ej: "2000-05-20". */
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @IsDateString()
  fechaNacimiento!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  /** Si no se envía, el schema de Mongoose aplica el default 'usuario'. */
  @IsOptional()
  @IsString()
  @IsIn(['usuario', 'administrador'])
  perfil?: string;
}
