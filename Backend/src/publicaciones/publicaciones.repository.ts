import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';

@Injectable()
export class PublicacionesRepository {
  constructor(
    @InjectModel(Publicacion.name)
    private modelo: Model<PublicacionDocument>,
  ) {}

  async crear(
    dto: CrearPublicacionDto,
    imagenUrl: string,
    imagenPublicId: string,
  ): Promise<PublicacionDocument> {
    const publicacion = new this.modelo({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      usuario: dto.usuarioId,
      imagenUrl,
      imagenPublicId,
    });
    return publicacion.save();
  }

  async listar(query: ListarPublicacionesDto): Promise<any[]> {
    const filtro: any = { activo: true };
    if (query.usuarioId) {
      filtro.usuario = new Types.ObjectId(query.usuarioId);
    }

    if (query.ordenarPor === 'likes') {
      // Paso 1: obtener IDs ordenados por cantidad de likes
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

      // Paso 2: poblar con populate (que sabemos que funciona)
      const docs = await this.modelo
        .find({ _id: { $in: idList } })
        .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil')
        .lean()
        .exec();

      // Restaurar el orden original de la aggregation
      const orden = new Map(idList.map((id: any, i: number) => [id.toString(), i]));
      return [...docs].sort(
        (a: any, b: any) => (orden.get(a._id.toString()) ?? 0) - (orden.get(b._id.toString()) ?? 0),
      );
    }

    // Caso por defecto: ordenar por fecha
    return this.modelo
      .find(filtro)
      .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil')
      .sort({ createdAt: -1 })
      .skip(Number(query.offset ?? 0))
      .limit(Number(query.limit ?? 10))
      .lean()
      .exec() as any;
  }

  async contarTotal(query: ListarPublicacionesDto): Promise<number> {
    const filtro: any = { activo: true };
    if (query.usuarioId) filtro.usuario = query.usuarioId;
    return this.modelo.countDocuments(filtro);
  }

  async buscarPorId(id: string): Promise<PublicacionDocument | null> {
    return this.modelo
      .findById(id)
      .populate('usuario', 'nombre apellido nombreUsuario fotoPerfil')
      .exec();
  }

  async bajaLogica(id: string): Promise<PublicacionDocument | null> {
    return this.modelo
      .findByIdAndUpdate(id, { activo: false }, { returnDocument: 'after' })
      .exec();
  }

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

  async tieneLike(publicacionId: string, usuarioId: string): Promise<boolean> {
    const count = await this.modelo.countDocuments({
      _id: publicacionId,
      likes: usuarioId,
    });
    return count > 0;
  }
}
