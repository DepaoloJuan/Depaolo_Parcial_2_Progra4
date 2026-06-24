import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { multerConfig } from '../cloudinary/multer.config';

/**
 * Controlador de autenticación.
 * Gestiona el registro de nuevos usuarios y el login.
 */
@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  /**
   * POST /api/v1/autenticacion/registro
   * Recibe multipart/form-data porque el registro incluye una imagen de perfil opcional.
   * El interceptor FileInterceptor extrae el archivo del campo "fotoPerfil" y lo deja
   * disponible en el parámetro `imagen`.
   */
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('fotoPerfil', multerConfig))
  async registrar(
    @Body() dto: CrearUsuarioDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.autenticacionService.registrar(dto, imagen);
  }

  /**
   * POST /api/v1/autenticacion/login
   * Recibe JSON con identificador (correo o username) y contraseña.
   * Responde 200 con los datos del usuario o 401 si las credenciales son inválidas.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.autenticacionService.login(dto);
  }
}
