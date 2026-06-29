import { Controller, Get, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { Roles } from '../../autenticacion/decorators/roles.decorator';

@Controller('estadisticas')
@Roles('administrador')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // GET /api/v1/estadisticas/publicaciones-por-usuario
  // Devuelve cuántas publicaciones hizo cada usuario en el rango de fechas
  @Get('publicaciones-por-usuario')
  async publicacionesPorUsuario(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.publicacionesPorUsuario(
      new Date(desde),
      new Date(hasta),
    );
  }

  // GET /api/v1/estadisticas/comentarios-por-tiempo
  // Devuelve cuántos comentarios se hicieron en el rango de fechas
  @Get('comentarios-por-tiempo')
  async comentariosPorTiempo(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.comentariosPorTiempo(
      new Date(desde),
      new Date(hasta),
    );
  }

  // GET /api/v1/estadisticas/comentarios-por-publicacion
  // Devuelve cuántos comentarios tiene cada publicación en el rango de fechas
  @Get('comentarios-por-publicacion')
  async comentariosPorPublicacion(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
  ) {
    return this.estadisticasService.comentariosPorPublicacion(
      new Date(desde),
      new Date(hasta),
    );
  }
}
