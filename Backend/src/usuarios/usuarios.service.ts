import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosRepository } from './usuarios.repository';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuarioDocument } from './schemas/usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(private readonly usuariosRepository: UsuariosRepository) {}

  async registrar(
    dto: CrearUsuarioDto,
    fotoPerfil?: string,
  ): Promise<UsuarioDocument> {
    // verificamos que el correo no esté en uso
    const correoExiste = await this.usuariosRepository.existeCorreo(dto.correo);
    if (correoExiste) {
      throw new ConflictException('El correo ya está registrado');
    }

    // verificamos que el nombre de usuario no esté en uso
    const nombreUsuarioExiste = await this.usuariosRepository.existeNombreUsuario(dto.nombreUsuario);
    if (nombreUsuarioExiste) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // encriptamos la contraseña — nunca se guarda en texto plano
    const hash = await bcrypt.hash(dto.contrasenia, 10);

    // creamos el usuario con la contraseña hasheada
    return this.usuariosRepository.crear({
      ...dto,
      contrasenia: hash,
      fotoPerfil: fotoPerfil ?? '',
    });
  }

  async validarCredenciales(
    identificador: string,
    contrasenia: string,
  ): Promise<UsuarioDocument | null> {
    // buscamos CON contraseña para poder comparar
    let usuarioConContrasenia = await this.usuariosRepository.buscarPorCorreo(identificador, true);
    if (!usuarioConContrasenia) {
      usuarioConContrasenia = await this.usuariosRepository.buscarPorNombreUsuario(identificador, true);
    }
    if (!usuarioConContrasenia) return null;

    // comparamos la contraseña
    const contraseniaValida = await bcrypt.compare(contrasenia, usuarioConContrasenia.contrasenia);
    if (!contraseniaValida) return null;

    // buscamos de nuevo SIN contraseña para devolver al cliente
    return this.usuariosRepository.buscarPorId(usuarioConContrasenia._id.toString());
  }
}