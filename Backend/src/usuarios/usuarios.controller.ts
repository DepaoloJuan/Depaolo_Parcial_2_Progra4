import {
  Controller,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ActualizarUsuarioDto } from './dto/actualizar-usuarios.dto';
import { multerConfig } from '../cloudinary/multer.config';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('fotoPerfil', multerConfig))
  async actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarUsuarioDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    let fotoPerfil: string | undefined;
    if (imagen) {
      const resultado = await this.cloudinaryService.subirImagen(imagen, 'perfiles');
      fotoPerfil = resultado.secure_url;
    }
    return this.usuariosService.actualizar(id, dto, fotoPerfil);
  }
}
