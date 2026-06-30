import { Controller, Post, Put, Get, Body, Param, Query } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ActualizarComentarioDto } from './dto/actualizar-comentario.dto';

// Todas las rutas de este controller quedan bajo /api/v1/comentarios
@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // POST /api/v1/comentarios
  @Post()
  async crear(@Body() dto: CrearComentarioDto) {
    return this.comentariosService.crear(dto);
  }

  // PUT /api/v1/comentarios/:id?usuarioId=<id>
  // usuarioId va como query param para verificar autoría sin necesidad de buscarlo en el token
  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarComentarioDto,
    @Query('usuarioId') usuarioId: string,
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
