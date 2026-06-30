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

  async registrar(dto: CrearUsuarioDto, imagen?: Express.Multer.File) {
    let fotoPerfil: string | undefined;
    if (imagen) {
      const resultado = await this.cloudinaryService.subirImagen(imagen, 'perfiles');
      fotoPerfil = resultado.secure_url;
    }

    const usuario = await this.usuariosService.registrar(dto, fotoPerfil);

    // Generamos el token inmediatamente después del registro para que el usuario quede logueado
    const token = this.generarToken(usuario.id, usuario.correo, usuario.nombreUsuario, usuario.perfil);

    return { token, usuario };
  }

  async login(dto: LoginDto) {
    const usuarioCrudo = await this.usuariosService.validarCredenciales(
      dto.identificador,
      dto.contrasenia,
    );

    if (!usuarioCrudo) throw new UnauthorizedException('Credenciales inválidas');

    // activo:false → usuario deshabilitado por un administrador
    if (!usuarioCrudo.activo) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada. Contactá al administrador.');
    }

    // Generamos el token ANTES de sanitizar, porque necesitamos el _id del documento crudo
    const token = this.generarToken(
      usuarioCrudo._id.toString(),
      usuarioCrudo.correo,
      usuarioCrudo.nombreUsuario,
      usuarioCrudo.perfil,
    );

    // buscarPorId devuelve el usuario ya sanitizado (sin contraseña ni _id)
    const usuario = await this.usuariosService.buscarPorId(usuarioCrudo._id.toString());

    return { token, usuario };
  }

  async autorizar(token: string) {
    try {
      // verify() lanza JsonWebTokenError o TokenExpiredError si el token es inválido o venció
      const payload = this.jwtService.verify(token);

      // Buscamos en la DB para devolver datos frescos (el usuario pudo haber actualizado su perfil)
      const usuario = await this.usuariosService.buscarPorId(payload.sub);

      if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

      return usuario;
    } catch {
      // Capturamos cualquier error de JWT y lo convertimos en 401
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }

  async refrescar(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      const usuario = await this.usuariosService.buscarPorId(payload.sub);

      if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

      // Generamos un token nuevo con la misma payload pero con el vencimiento reiniciado a 15 min
      const nuevoToken = this.generarToken(usuario.id, usuario.correo, usuario.nombreUsuario, usuario.perfil);

      return { token: nuevoToken, usuario };
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }

  // sub (subject) es la convención JWT para el ID del usuario — los otros campos son extras
  private generarToken(id: string, correo: string, nombreUsuario: string, perfil: string): string {
    return this.jwtService.sign({ sub: id, correo, nombreUsuario, perfil });
  }
}
