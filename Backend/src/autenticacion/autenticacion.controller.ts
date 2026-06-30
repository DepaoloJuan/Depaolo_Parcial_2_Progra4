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
import { Publica } from './decorators/public.decorator';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  // @Publica() es necesario porque el JwtAuthGuard global bloquearía estas rutas sin token
  @Publica()
  @Post('registro')
  @UseInterceptors(FileInterceptor('fotoPerfil', multerConfig)) // acepta multipart/form-data por la imagen
  async registrar(
    @Body() dto: CrearUsuarioDto,
    @UploadedFile() fotoPerfil?: Express.Multer.File,
  ) {
    return this.autenticacionService.registrar(dto, fotoPerfil);
  }

  @Publica()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.autenticacionService.login(dto);
  }

  // El frontend llama a esta ruta al iniciar la app (página cargando) para validar el token guardado
  @Publica()
  @Post('autorizar')
  async autorizar(@Body('token') token: string) {
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    return this.autenticacionService.autorizar(token);
  }

  // El frontend llama a esta ruta cuando el usuario acepta extender la sesión en el modal
  @Publica()
  @Post('refrescar')
  async refrescar(@Body('token') token: string) {
    if (!token) throw new UnauthorizedException('Token no proporcionado');
    return this.autenticacionService.refrescar(token);
  }
}
