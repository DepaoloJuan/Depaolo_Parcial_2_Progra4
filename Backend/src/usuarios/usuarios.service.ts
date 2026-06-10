import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsuariosRepository } from './usuarios.repository';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly usuariosRepository: UsuariosRepository) {}

  async registrar(dto: CrearUsuarioDto, fotoPerfil?: string) {
    const correoExiste = await this.usuariosRepository.existeCorreo(dto.correo);
    if (correoExiste) {
      throw new ConflictException('El correo ya está registrado');
    }

    const nombreUsuarioExiste = await this.usuariosRepository.existeNombreUsuario(dto.nombreUsuario);
    if (nombreUsuarioExiste) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const hash = await bcrypt.hash(dto.contrasenia, 10);

    const usuario = await this.usuariosRepository.crear({
      ...dto,
      contrasenia: hash,
      fotoPerfil: fotoPerfil ?? '',
    });

    // devolvemos el usuario sin la contraseña
    return this.sanitizarUsuario(usuario);
  }

  async validarCredenciales(identificador: string, contrasenia: string) {
    let usuario = await this.usuariosRepository.buscarPorCorreo(identificador);
    if (!usuario) {
      usuario = await this.usuariosRepository.buscarPorNombreUsuario(identificador);
    }
    if (!usuario) return null;

    const contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
    if (!contraseniaValida) return null;

    return usuario;
  }

  // método privado que elimina la contraseña antes de devolver el usuario
  private sanitizarUsuario(usuario: any) {
    const obj = usuario.toObject ? usuario.toObject({ virtuals: true }) : usuario;
    const { contrasenia, _id, __v, ...resto } = obj;
    return resto;
  }
}
