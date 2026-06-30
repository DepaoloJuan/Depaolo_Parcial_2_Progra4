import { IsNotEmpty, IsString } from 'class-validator';

// Solo permite editar el mensaje — modificado:true lo pone el repositorio automáticamente
export class ActualizarComentarioDto {
  @IsString()
  @IsNotEmpty()
  mensaje!: string;
}
