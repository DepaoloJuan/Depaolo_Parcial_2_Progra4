import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El identificador es obligatorio' })
  @IsString()
  // puede ser correo o nombre de usuario
  identificador!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  contrasenia!: string;
}