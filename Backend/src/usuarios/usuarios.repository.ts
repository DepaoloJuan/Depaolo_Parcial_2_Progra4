import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Injectable()
export class UsuariosRepository {
  constructor(
    @InjectModel(Usuario.name)
    private modelo: Model<UsuarioDocument>,
  ) {}

  async crear(datos: CrearUsuarioDto & { contrasenia: string; fotoPerfil?: string }): Promise<UsuarioDocument> {
    const usuario = new this.modelo(datos);
    return usuario.save();
  }

  async buscarPorCorreo(correo: string): Promise<UsuarioDocument | null> {
    return this.modelo.findOne({ correo: correo.toLowerCase() }).exec();
  }

  async buscarPorNombreUsuario(nombreUsuario: string): Promise<UsuarioDocument | null> {
    return this.modelo.findOne({ nombreUsuario }).exec();
  }

  async existeCorreo(correo: string): Promise<boolean> {
    const count = await this.modelo.countDocuments({ correo: correo.toLowerCase() });
    return count > 0;
  }

  async existeNombreUsuario(nombreUsuario: string): Promise<boolean> {
    const count = await this.modelo.countDocuments({ nombreUsuario });
    return count > 0;
  }

  async buscarPorId(id: string): Promise<UsuarioDocument | null> {
    return this.modelo.findById(id).exec();
  }
}