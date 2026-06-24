import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsuariosRepository } from './usuarios.repository';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuarios.dto';

/**
 * Lógica de negocio para la gestión de usuarios.
 * Orquesta el repositorio y aplica reglas como unicidad de correo/username y hashing.
 */
@Injectable()
export class UsuariosService {
  constructor(private readonly usuariosRepository: UsuariosRepository) {}

  /**
   * Registra un nuevo usuario tras validar unicidad de correo y nombre de usuario.
   * @param fotoPerfil URL de Cloudinary; vacío si no se cargó imagen.
   * @returns Usuario persistido sin la contraseña.
   */
  async registrar(dto: CrearUsuarioDto, fotoPerfil?: string) {
    const correoExiste = await this.usuariosRepository.existeCorreo(dto.correo);
    if (correoExiste) {
      throw new ConflictException('El correo ya está registrado');
    }

    const nombreUsuarioExiste = await this.usuariosRepository.existeNombreUsuario(dto.nombreUsuario);
    if (nombreUsuarioExiste) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // 10 salt rounds: balance entre seguridad y tiempo de cómputo (~100ms)
    const hash = await bcrypt.hash(dto.contrasenia, 10);

    const usuario = await this.usuariosRepository.crear({
      ...dto,
      contrasenia: hash,
      fotoPerfil: fotoPerfil ?? '',
    });

    return this.sanitizarUsuario(usuario);
  }

  /**
   * Valida credenciales de login.
   * Acepta correo o nombre de usuario como identificador.
   * @returns El documento de usuario si las credenciales son correctas, null si no.
   */
  async validarCredenciales(identificador: string, contrasenia: string) {
    // Intenta por correo primero, luego por nombre de usuario
    let usuario = await this.usuariosRepository.buscarPorCorreo(identificador);
    if (!usuario) {
      usuario = await this.usuariosRepository.buscarPorNombreUsuario(identificador);
    }
    if (!usuario) return null;

    // bcrypt.compare hashea la contraseña recibida y la compara con el hash guardado
    const contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
    if (!contraseniaValida) return null;

    return usuario;
  }

  /**
   * Actualiza los datos del perfil de un usuario.
   * Solo sobrescribe los campos que se envían (partial update).
   * @param fotoPerfil Si se sube nueva imagen, reemplaza la URL anterior.
   */
  async actualizar(
    id: string,
    dto: ActualizarUsuarioDto,
    fotoPerfil?: string,
  ) {
    const datos: Record<string, unknown> = { ...dto };
    if (fotoPerfil) datos.fotoPerfil = fotoPerfil;

    const usuario = await this.usuariosRepository.actualizar(id, datos);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return this.sanitizarUsuario(usuario);
  }

  /**
   * Elimina contrasenia, _id y __v antes de devolver el usuario al cliente.
   * Usa toObject({ virtuals: true }) para incluir el campo "id" virtual de Mongoose.
   */
  private sanitizarUsuario(usuario: any) {
    const obj = usuario.toObject ? usuario.toObject({ virtuals: true }) : usuario;
    const { contrasenia, _id, __v, ...resto } = obj;
    return resto;
  }
}
