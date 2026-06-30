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
import { Roles } from '../autenticacion/decorators/roles.decorator';
import { multerConfig } from '../cloudinary/multer.config';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // GET /api/v1/usuarios — solo administradores
  @Get()
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  listar() {
    return this.usuariosService.listar();
  }

  // POST /api/v1/usuarios — crea un usuario nuevo (admin puede elegir perfil)
  @Post()
  @Roles('administrador')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('fotoPerfil', multerConfig))
  async crear(
    @Body() dto: CrearUsuarioDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    let fotoPerfil: string | undefined;
    if (imagen) {
      const resultado = await this.cloudinaryService.subirImagen(imagen, 'perfiles');
      fotoPerfil = resultado.secure_url;
    }
    return this.usuariosService.crearPorAdmin(dto, fotoPerfil);
  }

  // DELETE /api/v1/usuarios/:id — deshabilita (baja lógica), solo administradores
  @Delete(':id')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  deshabilitar(@Param('id') id: string) {
    return this.usuariosService.deshabilitar(id);
  }

  // POST /api/v1/usuarios/:id/rehabilitar — rehabilita un usuario deshabilitado
  @Post(':id/rehabilitar')
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  rehabilitar(@Param('id') id: string) {
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
      const resultado = await this.cloudinaryService.subirImagen(imagen, 'perfiles');
      fotoPerfil = resultado.secure_url;
    }
    return this.usuariosService.actualizar(id, dto, fotoPerfil);
  }
}
