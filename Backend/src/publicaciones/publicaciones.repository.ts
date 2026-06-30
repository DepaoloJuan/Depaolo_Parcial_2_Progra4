import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';

/**
 * Capa de acceso a datos para la colección "publicaciones".
 * Centraliza todas las operaciones con MongoDB; el Service no toca el Model directamente.
 */
@Injectable()
export class PublicacionesRepository {
  constructor(
    @InjectModel(Publicacion.name)
    private modelo: Model<PublicacionDocument>,
  ) {}

  /**
   * Crea una nueva publicación con los datos del DTO y las URLs de Cloudinary.
   * usuarioId llega como parámetro separado — el DTO ya no lo incluye para evitar
   * que el cliente pueda falsificar el autor de la publicación.
   */
  async crear(
    dto: CrearPublicacionDto,
    usuarioId: string,
    imagenUrl: string,
    imagenPublicId: string,
  ): Promise<PublicacionDocument> {
    const publicacion = new this.modelo({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      usuario: new Types.ObjectId(usuarioId),
      imagenUrl,
      imagenPublicId,
    });
    return publicacion.save();
  }

  /**
   * Lista publicaciones activas con paginación y ordenamiento.
   *
   * Cuando se ordena por 'likes' se necesita calcular la cantidad de elementos
   * en el array antes de ordenar — algo que find().sort() no puede hacer.
   * Por eso se usa un pipeline de aggregation en dos pasos:
   *   1. Aggregation: calcula likesCount y obtiene los IDs ordenados + paginados.
   *   2. find + populate: carga los documentos completos con los datos del usuario,
   *      ya que $lookup dentro de aggregation es más verboso y menos mantenible.
   *   3. Reordenamiento en memoria: restaura el orden de la aggregation porque
   *      find({ _id: { $in: [...] } }) no garantiza el orden de los resultados.
   */
  async listar(query: ListarPublicacionesDto): Promise<any[]> {
    const filtro: any = { activo: true };

    if (query.usuarioId) {
      // Convertimos a ObjectId para que la comparación en el filtro sea correcta
      filtro.usuario = new Types.ObjectId(query.usuarioId);
    }

    if (query.ordenarPor === 'likes') {
      const ids = await this.modelo
        .aggregate([
          { $match: filtro },
          { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
          { $sort: { likesCount: -1, createdAt: -1 } },
          { $skip: Number(query.offset ?? 0) },
          { $limit: Number(query.limit ?? 10) },
          { $project: { _id: 1 } },
        ])
        .exec();

      const idList = ids.map((d: any) => d._id);

      const docs = await this.modelo
        .find({ _id: { $in: idList } })
        .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil')
        .lean()
        .exec();

      const orden = new Map(idList.map((id: any, i: number) => [id.toString(), i]));
      return [...docs].sort(
        (a: any, b: any) =>
          (orden.get(a._id.toString()) ?? 0) - (orden.get(b._id.toString()) ?? 0),
      ) as any;
    }

    // Ordenamiento por fecha (default): find estándar con sort y paginación
    return this.modelo
      .find(filtro)
      .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil')
      .sort({ createdAt: -1 })
      .skip(Number(query.offset ?? 0))
      .limit(Number(query.limit ?? 10))
      .lean()
      .exec() as any;
  }

  /** Cuenta el total de publicaciones activas (para calcular hayMas en el frontend). */
  async contarTotal(query: ListarPublicacionesDto): Promise<number> {
    const filtro: any = { activo: true };
    if (query.usuarioId) filtro.usuario = new Types.ObjectId(query.usuarioId);
    return this.modelo.countDocuments(filtro);
  }

  /** Busca una publicación por su _id y puebla los datos del usuario autor. */
  async buscarPorId(id: string): Promise<PublicacionDocument | null> {
    return this.modelo
      .findOne({ _id: new Types.ObjectId(id), activo: true })
      .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil')
      .exec();
  }

  /**
   * Baja lógica: marca la publicación como inactiva en lugar de eliminarla.
   * Los documentos con activo: false no aparecen en los listados.
   */
  async bajaLogica(id: string): Promise<PublicacionDocument | null> {
    return this.modelo
      .findByIdAndUpdate(id, { activo: false }, { returnDocument: 'after' })
      .exec();
  }

  /**
   * Agrega un like. $addToSet garantiza que el mismo userId no se duplique
   * aunque el cliente envíe la request dos veces (idempotente a nivel DB).
   */
  async agregarLike(
    publicacionId: string,
    usuarioId: string,
  ): Promise<PublicacionDocument | null> {
    return this.modelo
      .findByIdAndUpdate(
        publicacionId,
        { $addToSet: { likes: usuarioId } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  /**
   * Elimina un like. $pull remueve todas las ocurrencias del valor del array,
   * aunque con $addToSet nunca debería haber más de una.
   */
  async quitarLike(
    publicacionId: string,
    usuarioId: string,
  ): Promise<PublicacionDocument | null> {
    return this.modelo
      .findByIdAndUpdate(
        publicacionId,
        { $pull: { likes: usuarioId } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  /** Verifica si un usuario ya dio like a una publicación. */
  async tieneLike(publicacionId: string, usuarioId: string): Promise<boolean> {
    const count = await this.modelo.countDocuments({
      _id: publicacionId,
      likes: usuarioId,
    });
    return count > 0;
  }
}
