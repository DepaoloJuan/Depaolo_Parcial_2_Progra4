import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from '../schemas/publicacion.schema';
import { Comentario, ComentarioDocument } from '../../comentarios/schemas/comentario.schema';

/**
 * Servicio de estadísticas para el panel de administración.
 * Ejecuta aggregation pipelines de MongoDB para obtener métricas agrupadas
 * por usuario, por día y por publicación dentro de un rango de fechas.
 *
 * Accede directamente a los modelos de Publicacion y Comentario ya que
 * las consultas cruzan ambas colecciones mediante $lookup.
 */
@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModelo: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private comentarioModelo: Model<ComentarioDocument>,
  ) {}

  /**
   * Convierte los strings de fecha a objetos Date para usarlos en los filtros.
   * Si no se reciben fechas, aplica un rango por defecto de los últimos 30 días.
   * hastaDate se lleva a las 23:59:59.999 para incluir todos los eventos del día final.
   */
  private parsearRango(desde?: string, hasta?: string) {
    const desdeDate = desde ? new Date(desde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const hastaDate = hasta ? new Date(hasta) : new Date();
    hastaDate.setHours(23, 59, 59, 999);
    return { desdeDate, hastaDate };
  }

  /**
   * Cuenta publicaciones activas por usuario en el rango dado.
   * Pipeline: filtra por rango → agrupa por usuario → join con colección usuarios
   * → proyecta nombreUsuario + cantidad → ordena de mayor a menor.
   */
  async publicacionesPorUsuario(desde?: string, hasta?: string) {
    const { desdeDate, hastaDate } = this.parsearRango(desde, hasta);

    return this.publicacionModelo.aggregate([
      {
        $match: {
          activo: true,
          createdAt: { $gte: desdeDate, $lte: hastaDate },
        },
      },
      {
        $group: {
          _id: '$usuario',
          cantidad: { $sum: 1 },
        },
      },
      {
        // $lookup reemplaza el _id del grupo (ObjectId de usuario) con el documento completo
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 0,
          nombreUsuario: '$usuario.nombreUsuario',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }

  /**
   * Cuenta comentarios activos agrupados por día en el rango dado.
   * $dateToString convierte el timestamp a 'YYYY-MM-DD' para agrupar por día
   * sin importar la hora exacta de cada comentario.
   * Resultado ordenado cronológicamente (ascendente) para el gráfico de líneas.
   */
  async comentariosPorTiempo(desde?: string, hasta?: string) {
    const { desdeDate, hastaDate } = this.parsearRango(desde, hasta);

    return this.comentarioModelo.aggregate([
      {
        $match: {
          activo: true,
          createdAt: { $gte: desdeDate, $lte: hastaDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          cantidad: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          fecha: '$_id',
          cantidad: 1,
        },
      },
      { $sort: { fecha: 1 } },
    ]);
  }

  /**
   * Cuenta comentarios activos por publicación en el rango dado.
   * Limitado a las top 10 publicaciones con más comentarios para no saturar
   * el gráfico de torta cuando hay muchas publicaciones.
   * Pipeline: filtra → agrupa por publicacionId → join con publicaciones → proyecta título.
   */
  async comentariosPorPublicacion(desde?: string, hasta?: string) {
    const { desdeDate, hastaDate } = this.parsearRango(desde, hasta);

    return this.comentarioModelo.aggregate([
      {
        $match: {
          activo: true,
          createdAt: { $gte: desdeDate, $lte: hastaDate },
        },
      },
      {
        $group: {
          _id: '$publicacionId',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'publicaciones',
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },
      {
        $project: {
          _id: 0,
          titulo: '$publicacion.titulo',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
      { $limit: 10 },
    ]);
  }
}
