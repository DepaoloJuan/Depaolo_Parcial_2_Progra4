import { Controller, Post, Put, Get, Body, Param, Query } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ActualizarComentarioDto } from './dto/actualizar-comentario.dto';
import { UsuarioActual } from '../autenticacion/decorators/usuario-actual.decorator';

/**
 * Todas las rutas de este controller quedan bajo /api/v1/comentarios.
 * Protegidas por JwtAuthGuard global — el usuario siempre está autenticado al llegar acá.
 * El usuarioId siempre se lee del token verificado via @UsuarioActual — nunca del cliente.
 */
@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  /**
   * POST /api/v1/comentarios
   * Crea un comentario. El usuarioId no forma parte del DTO — se extrae del token
   * y se pasa al service por separado.
   */
  @Post()
  async crear(
    @Body() dto: CrearComentarioDto,
    @UsuarioActual('usuarioId') usuarioId: string,
  ) {
    return this.comentariosService.crear(dto, usuarioId);
  }

  /**
   * PUT /api/v1/comentarios/:id
   * Edita el mensaje de un comentario.
   * El usuarioId viene del token para verificar autoría sin confiar en el cliente.
   */
  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarComentarioDto,
    @UsuarioActual('usuarioId') usuarioId: string,
  ) {
    return this.comentariosService.actualizar(id, dto, usuarioId);
  }

  // GET /api/v1/comentarios/:publicacionId?offset=0&limit=5
  // offset y limit permiten paginar — el frontend carga de a 5 y pide más con "cargar más"
  @Get(':publicacionId')
  async listar(
    @Param('publicacionId') publicacionId: string,
    @Query('offset') offset: string = '0',
    @Query('limit') limit: string = '5',
  ) {
    // Los query params siempre llegan como string; los convertimos a número antes de pasarlos
    return this.comentariosService.listarPorPublicacion(
      publicacionId,
      parseInt(offset),
      parseInt(limit),
    );
  }
}
