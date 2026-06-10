import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto';
import { LoginDto } from './dto/login.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  // POST /api/v1/autenticacion/registro
  // HttpStatus.CREATED = 201 — correcto para creación de recursos
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async registrar(@Body() dto: CrearUsuarioDto) {
    return this.autenticacionService.registrar(dto);
  }

  // POST /api/v1/autenticacion/login
  // HttpStatus.OK = 200 — correcto para login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.autenticacionService.login(dto);
  }
}