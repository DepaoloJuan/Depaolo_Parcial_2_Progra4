import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { multerConfig } from '../cloudinary/multer.config';

/**
 * Controlador de publicaciones.
 * Expone los endpoints de creación, listado, eliminación y manejo de likes.
 */
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  /**
   * POST /api/v1/publicaciones
   * Crea una publicación. Acepta multipart/form-data porque la imagen es opcional
   * pero debe viajar en el mismo request que los campos de texto.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagen', multerConfig))
  crear(
    @Body() dto: CrearPublicacionDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(dto, imagen);
  }

  /**
   * GET /api/v1/publicaciones
   * Lista publicaciones activas. Soporta paginación y ordenamiento via query params:
   *   ?offset=0&limit=10&ordenarPor=fecha|likes&usuarioId=<id>
   */
  @Get()
  listar(@Query() query: ListarPublicacionesDto) {
    return this.publicacionesService.listar(query);
  }

  // GET /api/v1/publicaciones/:id
  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.publicacionesService.obtenerPorId(id);
  }

  // DELETE /api/v1/publicaciones/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  eliminar(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
    @Query('perfil') perfil: string,
  ) {
    return this.publicacionesService.eliminar(id, usuarioId, perfil);
  }

  /**
   * POST /api/v1/publicaciones/:id/likes
   * Agrega un like. El usuarioId va en el body (JSON) para no exponerlo en la URL.
   */
  @Post(':id/likes')
  @HttpCode(HttpStatus.OK)
  darLike(@Param('id') id: string, @Body('usuarioId') usuarioId: string) {
    return this.publicacionesService.darLike(id, usuarioId);
  }

  /**
   * DELETE /api/v1/publicaciones/:id/likes
   * Quita un like. El usuarioId va en el body del DELETE .
   */
  @Delete(':id/likes')
  @HttpCode(HttpStatus.OK)
  quitarLike(@Param('id') id: string, @Body('usuarioId') usuarioId: string) {
    return this.publicacionesService.quitarLike(id, usuarioId);
  }
}
