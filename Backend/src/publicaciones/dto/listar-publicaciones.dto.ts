import { IsOptional, IsNumber, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para los query params del endpoint GET /publicaciones.
 * class-transformer convierte los strings de la query string a los tipos correctos
 * gracias a @Type(() => Number) y enableImplicitConversion en el ValidationPipe global.
 */
export class ListarPublicacionesDto {
  /** Cantidad de documentos a saltear (paginación). */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  /** Cantidad máxima de documentos a devolver por página. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  /**
   * Criterio de ordenamiento:
   * - 'fecha': por createdAt descendente (más reciente primero, es el default)
   * - 'likes': por cantidad de likes descendente (usa aggregation pipeline)
   */
  @IsOptional()
  @IsIn(['fecha', 'likes'])
  ordenarPor?: 'fecha' | 'likes' = 'fecha';

  /** Si se provee, filtra las publicaciones de ese usuario (para mi-perfil). */
  @IsOptional()
  @IsString()
  usuarioId?: string;
}
