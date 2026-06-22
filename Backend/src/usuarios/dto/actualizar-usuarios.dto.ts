import { IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;
}
