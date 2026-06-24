import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para el endpoint de login.
 * El identificador acepta tanto correo electrónico como nombre de usuario;
 * la resolución del tipo se hace en UsuariosService.validarCredenciales().
 */
export class LoginDto {
  @IsNotEmpty({ message: 'El identificador es obligatorio' })
  @IsString()
  identificador!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  contrasenia!: string;
}
