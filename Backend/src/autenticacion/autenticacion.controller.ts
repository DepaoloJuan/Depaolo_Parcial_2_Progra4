import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { multerConfig } from '../cloudinary/multer.config';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  // REGISTRO — recibe los datos del usuario + foto de perfil opcional
  @Post('registro')
  @UseInterceptors(FileInterceptor('fotoPerfil', multerConfig))
  async registrar(
    @Body() dto: CrearUsuarioDto,
    @UploadedFile() fotoPerfil?: Express.Multer.File,
  ) {
    return this.autenticacionService.registrar(dto, fotoPerfil);
  }

  // LOGIN — recibe identificador (correo o nombreUsuario) + contraseña
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.autenticacionService.login(dto);
  }

  // AUTORIZAR — el frontend manda el token, nosotros lo validamos
  // Si es válido devolvemos los datos del usuario, si no → 401
  @Post('autorizar')
  async autorizar(@Body('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    return this.autenticacionService.autorizar(token);
  }

  // REFRESCAR — el frontend manda el token actual, nosotros devolvemos uno nuevo
  @Post('refrescar')
  async refrescar(@Body('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    return this.autenticacionService.refrescar(token);
  }
}
