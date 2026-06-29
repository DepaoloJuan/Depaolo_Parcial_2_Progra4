import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { multerConfig } from '../cloudinary/multer.config';
import { Roles } from '../autenticacion/decorators/roles.decorator';

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

  // GET /api/v1/usuarios — solo administradores
  @Get()
  @Roles('administrador')
  async listar() {
    return this.usuariosService.listar();
  }

  // POST /api/v1/usuarios — solo administradores
  // Crea un nuevo usuario con perfil elegible (usuario o administrador)
  @Post()
  @Roles('administrador')
  @UseInterceptors(FileInterceptor('fotoPerfil', multerConfig))
  async crear(
    @Body() dto: CrearUsuarioDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    let fotoPerfil: string | undefined;
    if (imagen) {
      const resultado = await this.cloudinaryService.subirImagen(
        imagen,
        'perfiles',
      );
      fotoPerfil = resultado.secure_url;
    }
    return this.usuariosService.registrar(dto, fotoPerfil);
  }

  // DELETE /api/v1/usuarios/:id — solo administradores
  // Baja lógica: pone activo: false
  @Delete(':id')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  async deshabilitar(@Param('id') id: string) {
    return this.usuariosService.deshabilitar(id);
  }

  // POST /api/v1/usuarios/:id/rehabilitar — solo administradores
  // Alta lógica: pone activo: true
  @Post(':id/rehabilitar')
  @Roles('administrador')
  async rehabilitar(@Param('id') id: string) {
    return this.usuariosService.rehabilitar(id);
  }

  // PUT /api/v1/usuarios/:id — el usuario actualiza su propio perfil
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
      const resultado = await this.cloudinaryService.subirImagen(
        imagen,
        'perfiles',
      );
      fotoPerfil = resultado.secure_url;
    }
    return this.usuariosService.actualizar(id, dto, fotoPerfil);
  }
}
