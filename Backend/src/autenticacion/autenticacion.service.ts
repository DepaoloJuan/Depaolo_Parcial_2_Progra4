import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { LoginDto } from './dto/login.dto';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async registrar(dto: CrearUsuarioDto, imagen?: Express.Multer.File) {
    // si viene imagen la subimos a Cloudinary y guardamos la URL
    let fotoPerfil = '';
    if (imagen) {
      const resultado = await this.cloudinaryService.subirImagen(
        imagen,
        'perfiles',
      );
      fotoPerfil = resultado.secure_url;
    }

    return this.usuariosService.registrar(dto, fotoPerfil);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.validarCredenciales(
      dto.identificador,
      dto.contrasenia,
    );

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada');
    }

    return this.sanitizarUsuario(usuario);
  }

  private sanitizarUsuario(usuario: any) {
    const obj = usuario.toObject
      ? usuario.toObject({ virtuals: true })
      : usuario;
    const { contrasenia, _id, __v, ...resto } = obj;
    return resto;
  }
}
