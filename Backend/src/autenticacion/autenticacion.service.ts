import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { LoginDto } from './dto/login.dto';
import { CrearUsuarioDto } from '../usuarios/dto/crear-usuario.dto';

/**
 * Servicio de autenticación.
 * Coordina el registro (con carga de imagen) y el login (validación de credenciales).
 */
@Injectable()
export class AutenticacionService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Registra un nuevo usuario.
   * Si se adjuntó imagen, la sube a Cloudinary antes de crear el documento.
   * @returns Usuario creado sin contraseña.
   */
  async registrar(dto: CrearUsuarioDto, imagen?: Express.Multer.File) {
    let fotoPerfil = '';
    if (imagen) {
      // Subimos el buffer en memoria a Cloudinary (carpeta "perfiles")
      const resultado = await this.cloudinaryService.subirImagen(imagen, 'perfiles');
      fotoPerfil = resultado.secure_url;
    }

    return this.usuariosService.registrar(dto, fotoPerfil);
  }

  /**
   * Valida credenciales y devuelve los datos del usuario si son correctas.
   * Lanza 401 si el identificador/contraseña no coinciden o si la cuenta está inactiva.
   */
  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.validarCredenciales(
      dto.identificador,
      dto.contrasenia,
    );

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Cuenta deshabilitada (baja lógica)
    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada');
    }

    return this.sanitizarUsuario(usuario);
  }

  /**
   * Elimina campos sensibles/internos antes de devolver el usuario al cliente.
   * toObject({ virtuals: true }) incluye el campo "id" virtual generado por Mongoose.
   */
  private sanitizarUsuario(usuario: any) {
    const obj = usuario.toObject
      ? usuario.toObject({ virtuals: true })
      : usuario;
    const { contrasenia, _id, __v, ...resto } = obj;
    return resto;
  }
}
