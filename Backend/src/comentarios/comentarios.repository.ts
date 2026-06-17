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

  // Crea un nuevo comentario en la DB
  async crear(dto: CrearComentarioDto): Promise<ComentarioDocument> {
    const comentario = new this.comentarioModel({
      publicacionId: new Types.ObjectId(dto.publicacionId),
      usuarioId: new Types.ObjectId(dto.usuarioId),
      mensaje: dto.mensaje,
    });
    return comentario.save();
  }

  // Busca un comentario por su ID (solo activos)
  async buscarPorId(id: string): Promise<ComentarioDocument | null> {
    return this.comentarioModel.findOne({
      _id: new Types.ObjectId(id),
      activo: true,
    });
  }

  // Modifica el mensaje y marca como modificado
  async actualizar(
    id: string,
    mensaje: string,
  ): Promise<ComentarioDocument | null> {
    return this.comentarioModel.findByIdAndUpdate(
      id,
      { mensaje, modificado: true },
      { new: true }, // devuelve el documento actualizado, no el anterior
    );
  }

  // Trae comentarios de una publicación, paginados, más recientes primero
  async listarPorPublicacion(
    publicacionId: string,
    offset: number,
    limit: number,
  ): Promise<{ comentarios: ComentarioDocument[]; total: number }> {
    const filtro = {
      publicacionId: new Types.ObjectId(publicacionId),
      activo: true,
    };

    // Ejecutamos las dos queries en paralelo para no esperar una tras otra
    const [comentarios, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1 }) // más recientes primero
        .skip(offset)
        .limit(limit)
        .populate('usuarioId', 'nombreUsuario fotoPerfil') // traemos datos del usuario
        .exec(),
      this.comentarioModel.countDocuments(filtro),
    ]);

    return { comentarios, total };
  }
}
