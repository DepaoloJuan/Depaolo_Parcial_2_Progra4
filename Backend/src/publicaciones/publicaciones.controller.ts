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

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // POST /api/v1/publicaciones
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagen', multerConfig))
  crear(
    @Body() dto: CrearPublicacionDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(dto, imagen);
  }

  // GET /api/v1/publicaciones
  @Get()
  listar(@Query() query: ListarPublicacionesDto) {
    return this.publicacionesService.listar(query);
  }

  // DELETE /api/v1/publicaciones/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  eliminar(
    @Param('id') id: string,
    @Body('usuarioId') usuarioId: string,
    @Body('perfil') perfil: string,
  ) {
    return this.publicacionesService.eliminar(id, usuarioId, perfil);
  }

  // POST /api/v1/publicaciones/:id/likes
  @Post(':id/likes')
  @HttpCode(HttpStatus.OK)
  darLike(@Param('id') id: string, @Body('usuarioId') usuarioId: string) {
    return this.publicacionesService.darLike(id, usuarioId);
  }

  // DELETE /api/v1/publicaciones/:id/likes
  @Delete(':id/likes')
  @HttpCode(HttpStatus.OK)
  quitarLike(@Param('id') id: string, @Body('usuarioId') usuarioId: string) {
    return this.publicacionesService.quitarLike(id, usuarioId);
  }
}
