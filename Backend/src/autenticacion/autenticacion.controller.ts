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

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  // POST /api/v1/autenticacion/registro
  // multipart/form-data porque recibe imagen + datos de texto
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('fotoPerfil', multerConfig))
  async registrar(
    @Body() dto: CrearUsuarioDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.autenticacionService.registrar(dto, imagen);
  }

  // POST /api/v1/autenticacion/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.autenticacionService.login(dto);
  }
}
