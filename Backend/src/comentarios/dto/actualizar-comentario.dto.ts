import { IsNotEmpty, IsString } from 'class-validator';

export class ActualizarComentarioDto {
  @IsString()
  @IsNotEmpty()
  mensaje!: string;
}
