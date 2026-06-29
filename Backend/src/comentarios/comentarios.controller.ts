import { Controller, Post, Put, Get, Body, Param, Query } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ActualizarComentarioDto } from './dto/actualizar-comentario.dto';

@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // POST /api/v1/comentarios
  // Agrega un nuevo comentario a una publicación
  @Post()
  async crear(@Body() dto: CrearComentarioDto) {
    return this.comentariosService.crear(dto);
  }

  // PUT /api/v1/comentarios/:id
  // Modifica el mensaje de un comentario propio
  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarComentarioDto,
    @Query('usuarioId') usuarioId: string,
  ) {
    return this.comentariosService.actualizar(id, dto, usuarioId);
  }

  // GET /api/v1/comentarios/:publicacionId
  // Trae comentarios de una publicación con paginación
  @Get(':publicacionId')
  async listar(
    @Param('publicacionId') publicacionId: string,
    @Query('offset') offset: string = '0',
    @Query('limit') limit: string = '5',
  ) {
    // Query params llegan como string, los convertimos a número
    return this.comentariosService.listarPorPublicacion(
      publicacionId,
      parseInt(offset),
      parseInt(limit),
    );
  }
}
