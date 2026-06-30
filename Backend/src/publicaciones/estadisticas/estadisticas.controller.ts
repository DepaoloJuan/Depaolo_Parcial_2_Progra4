import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { Roles } from '../../autenticacion/decorators/roles.decorator';

/**
 * Controlador de estadísticas para el dashboard de administración.
 * Todas las rutas requieren perfil 'administrador' — el RolesGuard global lo verifica.
 *
 * Recibe los parámetros de rango de fechas como query strings opcionales (?desde=&hasta=).
 * Si se omiten, el service aplica un rango por defecto de los últimos 30 días.
 */
@Controller('publicaciones/estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // GET /api/v1/publicaciones/estadisticas/publicaciones-por-usuario?desde=&hasta=
  // Alimenta el gráfico de barras: cantidad de publicaciones por usuario en el período.
  @Get('publicaciones-por-usuario')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  publicacionesPorUsuario(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
  }

  // GET /api/v1/publicaciones/estadisticas/comentarios-por-tiempo?desde=&hasta=
  // Alimenta el gráfico de líneas: evolución diaria de comentarios en el período.
  @Get('comentarios-por-tiempo')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  comentariosPorTiempo(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.estadisticasService.comentariosPorTiempo(desde, hasta);
  }

  // GET /api/v1/publicaciones/estadisticas/comentarios-por-publicacion?desde=&hasta=
  // Alimenta el gráfico de torta: distribución de comentarios entre publicaciones (top 10).
  @Get('comentarios-por-publicacion')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  comentariosPorPublicacion(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta);
  }
}
