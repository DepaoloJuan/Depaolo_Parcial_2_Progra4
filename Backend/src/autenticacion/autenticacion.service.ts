import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto';
import { UsuarioDocument } from '../usuarios/schemas/usuario.schema';

@Injectable()
export class AutenticacionService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async registrar(
    dto: CrearUsuarioDto,
    fotoPerfil?: string,
  ): Promise<UsuarioDocument> {
    // delega toda la lógica al UsuariosService
    return this.usuariosService.registrar(dto, fotoPerfil);
  }

  async login(dto: LoginDto): Promise<UsuarioDocument> {
    // validamos las credenciales
    const usuario = await this.usuariosService.validarCredenciales(
      dto.identificador,
      dto.contrasenia,
    );

    // si no existe o la contraseña no coincide, lanzamos 401
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // verificamos que el usuario esté activo
    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada');
    }

    return usuario;
  }
}