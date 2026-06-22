import { IsOptional, IsNumber, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarPublicacionesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['fecha', 'likes'])
  ordenarPor?: 'fecha' | 'likes' = 'fecha';

  @IsOptional()
  @IsString()
  usuarioId?: string;
}
