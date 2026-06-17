import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
  ) {}

  // REGISTRO — crea el usuario y devuelve token + usuario
  async registrar(dto: CrearUsuarioDto, imagen?: Express.Multer.File) {
    let fotoPerfil: string | undefined;
    if (imagen) {
      const resultado = await this.cloudinaryService.subirImagen(imagen, 'perfiles');
      fotoPerfil = resultado.secure_url;
    }
    const usuario = await this.usuariosService.registrar(dto, fotoPerfil);

    // Ahora además generamos el token para que el frontend lo guarde al instante
    const token = this.generarToken(usuario.id, usuario.nombreUsuario, usuario.perfil);

    return { token, usuario };
  }

  // LOGIN — valida credenciales y devuelve token + usuario
  async login(dto: LoginDto) {
    const usuarioCrudo = await this.usuariosService.validarCredenciales(
      dto.identificador,
      dto.contrasenia,
    );

    if (!usuarioCrudo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generarToken(
      usuarioCrudo._id.toString(),
      usuarioCrudo.nombreUsuario,
      usuarioCrudo.perfil,
    );

    // Sanitizamos DESPUÉS de generar el token, para que _id todavía exista
    const usuario = await this.usuariosService.buscarPorId(usuarioCrudo._id.toString());

    return { token, usuario };
  }

  // AUTORIZAR — valida que un token sea válido y devuelve los datos del usuario
  async autorizar(token: string) {
    try {
      // verify lanza una excepción si el token es inválido o está vencido
      const payload = this.jwtService.verify(token);

      // Buscamos el usuario en la DB para devolver sus datos actualizados
      const usuario = await this.usuariosService.buscarPorId(payload.sub);

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return usuario;
    } catch {
      // Cualquier error con el token (vencido, manipulado, etc.) → 401
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }

  // REFRESCAR — valida el token actual y emite uno nuevo con 15 minutos más
  async refrescar(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      // Buscamos el usuario para tener los datos frescos
      const usuario = await this.usuariosService.buscarPorId(payload.sub);

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Generamos un token nuevo con la misma información pero vencimiento renovado
      const nuevoToken = this.generarToken(usuario.id, usuario.nombreUsuario, usuario.perfil);

      return { token: nuevoToken, usuario };
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }

  private generarToken(id: string, nombreUsuario: string, perfil: string): string {
    const payload = { sub: id, nombreUsuario, perfil };
    return this.jwtService.sign(payload);
  }
}
