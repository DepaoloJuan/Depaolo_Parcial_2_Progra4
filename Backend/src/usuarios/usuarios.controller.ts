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

/**
 * Controlador de usuarios.
 * Expone los endpoints de gestión de perfil (edición de datos e imagen).
 */
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * PUT /api/v1/usuarios/:id
   * Actualiza el perfil del usuario. Acepta multipart/form-data para poder
   * recibir tanto campos de texto como la nueva foto de perfil en la misma request.
   *
   * @param id      ID de MongoDB del usuario a actualizar.
   * @param dto     Campos opcionales a modificar (nombre, apellido, descripcion, fechaNacimiento).
   * @param imagen  Archivo de imagen opcional; si se incluye se sube a Cloudinary.
   */
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
      // Subimos la imagen a la carpeta "perfiles" en Cloudinary y guardamos la URL segura
      const resultado = await this.cloudinaryService.subirImagen(imagen, 'perfiles');
      fotoPerfil = resultado.secure_url;
    }
    return this.usuariosService.actualizar(id, dto, fotoPerfil);
  }
}
