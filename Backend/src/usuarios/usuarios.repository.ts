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
    await usuario.save();
    // buscamos el documento recién creado — esta consulta respeta select: false
    return this.modelo.findById(usuario._id).exec() as Promise<UsuarioDocument>;
  }

  async buscarPorCorreo(correo: string, incluirContrasenia = false): Promise<UsuarioDocument | null> {
    const query = this.modelo.findOne({ correo: correo.toLowerCase() });
    if (incluirContrasenia) query.select('+contrasenia');
    return query.exec();
  }

  async buscarPorNombreUsuario(nombreUsuario: string, incluirContrasenia = false): Promise<UsuarioDocument | null> {
    const query = this.modelo.findOne({ nombreUsuario });
    if (incluirContrasenia) query.select('+contrasenia');
    return query.exec();
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