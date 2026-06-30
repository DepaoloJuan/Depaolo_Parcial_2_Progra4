import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { CrearComentarioDto } from './dto/crear-comentario.dto';

@Injectable()
export class ComentariosRepository {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<ComentarioDocument>,
  ) {}

  // usuarioId llega como parámetro separado — el DTO ya no lo incluye
  async crear(dto: CrearComentarioDto, usuarioId: string): Promise<ComentarioDocument> {
    const comentario = new this.comentarioModel({
      // Convertimos los IDs a ObjectId para que Mongoose los guarde con el tipo correcto
      publicacionId: new Types.ObjectId(dto.publicacionId),
      usuarioId: new Types.ObjectId(usuarioId),
      mensaje: dto.mensaje,
    });
    return comentario.save();
  }

  async buscarPorId(id: string): Promise<ComentarioDocument | null> {
    return this.comentarioModel.findOne({
      _id: new Types.ObjectId(id),
      activo: true, // solo devuelve comentarios activos (no eliminados)
    });
  }

  async actualizar(id: string, mensaje: string): Promise<ComentarioDocument | null> {
    return this.comentarioModel.findByIdAndUpdate(
      id,
      {
        mensaje,
        modificado: true, // marcamos el comentario como editado para que el frontend lo muestre
      },
      { new: true }, // { new: true } devuelve el documento YA actualizado, no el anterior
    );
  }

  async listarPorPublicacion(
    publicacionId: string,
    offset: number,
    limit: number,
  ): Promise<{ comentarios: ComentarioDocument[]; total: number }> {
    const filtro = {
      publicacionId: new Types.ObjectId(publicacionId),
      activo: true,
    };

    // Promise.all ejecuta ambas queries en paralelo — evita esperar una para empezar la otra
    const [comentarios, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1 }) // más recientes primero, como pide la consigna
        .skip(offset)
        .limit(limit)
        .populate('usuarioId', 'nombreUsuario fotoPerfil') // traemos solo los campos que el frontend necesita
        .exec(),
      this.comentarioModel.countDocuments(filtro), // total sin paginar, para calcular hayMas en el service
    ]);

    return { comentarios, total };
  }
}
