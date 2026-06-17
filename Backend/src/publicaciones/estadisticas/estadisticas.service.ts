import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Publicacion,
  PublicacionDocument,
} from '../schemas/publicacion.schema';
import {
  Comentario,
  ComentarioDocument,
} from '../../comentarios/schemas/comentario.schema';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<ComentarioDocument>,
  ) {}

  // Agrupa publicaciones por usuario y cuenta cuántas hizo en el rango
  async publicacionesPorUsuario(desde: Date, hasta: Date) {
    return this.publicacionModel.aggregate([
      {
        $match: {
          activo: true,
          createdAt: { $gte: desde, $lte: hasta },
        },
      },
      {
        $addFields: {
          usuarioObj: { $toObjectId: '$usuario' },
        },
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'usuarioObj',
          foreignField: '_id',
          as: 'datosUsuario',
        },
      },
      { $unwind: { path: '$datosUsuario', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$usuario',
          nombreUsuario: { $first: '$datosUsuario.nombreUsuario' },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }

  // Cuenta comentarios totales agrupados por día en el rango
  async comentariosPorTiempo(desde: Date, hasta: Date) {
    return this.comentarioModel.aggregate([
      {
        $match: {
          activo: true,
          createdAt: { $gte: desde, $lte: hasta },
        },
      },
      {
        $group: {
          _id: {
            año: { $year: '$createdAt' },
            mes: { $month: '$createdAt' },
            dia: { $dayOfMonth: '$createdAt' },
          },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { '_id.año': 1, '_id.mes': 1, '_id.dia': 1 } },
    ]);
  }

  // Cuenta comentarios por publicación en el rango
  async comentariosPorPublicacion(desde: Date, hasta: Date) {
    return this.comentarioModel.aggregate([
      {
        $match: {
          activo: true,
          createdAt: { $gte: desde, $lte: hasta },
        },
      },
      {
        $addFields: {
          publicacionObj: { $toObjectId: '$publicacionId' },
        },
      },
      {
        $lookup: {
          from: 'publicaciones',
          localField: 'publicacionObj',
          foreignField: '_id',
          as: 'datosPublicacion',
        },
      },
      { $unwind: { path: '$datosPublicacion', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$publicacionId',
          titulo: { $first: '$datosPublicacion.titulo' },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }
}
