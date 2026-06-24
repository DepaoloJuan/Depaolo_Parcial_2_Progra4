import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

/**
 * Capa de acceso a datos para la colección "usuarios".
 * Toda interacción con MongoDB pasa por aquí; el Service no usa el Model directamente.
 */
@Injectable()
export class UsuariosRepository {
  constructor(
    @InjectModel(Usuario.name)
    private modelo: Model<UsuarioDocument>,
  ) {}

  /** Persiste un nuevo documento de usuario y lo devuelve hidratado. */
  async crear(datos: CrearUsuarioDto & { contrasenia: string; fotoPerfil?: string }): Promise<UsuarioDocument> {
    const usuario = new this.modelo(datos);
    return usuario.save();
  }

  /**
   * Busca por correo de forma case-insensitive.
   * El campo ya se guarda en lowercase, así que toLowerCase() garantiza
   * que la comparación sea siempre consistente.
   */
  async buscarPorCorreo(correo: string): Promise<UsuarioDocument | null> {
    return this.modelo.findOne({ correo: correo.toLowerCase() }).exec();
  }

  /** Busca por nombre de usuario (sensible a mayúsculas según el schema). */
  async buscarPorNombreUsuario(nombreUsuario: string): Promise<UsuarioDocument | null> {
    return this.modelo.findOne({ nombreUsuario }).exec();
  }

  /** Devuelve true si ya existe un documento con ese correo. */
  async existeCorreo(correo: string): Promise<boolean> {
    const count = await this.modelo.countDocuments({ correo: correo.toLowerCase() });
    return count > 0;
  }

  /** Devuelve true si ya existe un documento con ese nombre de usuario. */
  async existeNombreUsuario(nombreUsuario: string): Promise<boolean> {
    const count = await this.modelo.countDocuments({ nombreUsuario });
    return count > 0;
  }

  /** Busca un usuario por su _id de MongoDB. */
  async buscarPorId(id: string): Promise<UsuarioDocument | null> {
    return this.modelo.findById(id).exec();
  }

  /**
   * Actualiza solo los campos recibidos (partial update).
   * returnDocument: 'after' devuelve el documento ya modificado,
   * evitando una segunda consulta para obtener el estado actualizado.
   */
  async actualizar(
    id: string,
    datos: Partial<{ nombre: string; apellido: string; descripcion: string; fechaNacimiento: string; fotoPerfil: string }>,
  ): Promise<UsuarioDocument | null> {
    return this.modelo
      .findByIdAndUpdate(id, datos, { returnDocument: 'after' })
      .exec();
  }
}
