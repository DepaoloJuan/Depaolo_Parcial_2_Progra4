import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PublicacionesRepository } from './publicaciones.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';

@Injectable()
export class PublicacionesService {
  constructor(
    private readonly publicacionesRepository: PublicacionesRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async crear(dto: CrearPublicacionDto, imagen?: Express.Multer.File) {
    let imagenUrl = '';
    let imagenPublicId = '';

    if (imagen) {
      const resultado = await this.cloudinaryService.subirImagen(
        imagen,
        'publicaciones',
      );
      imagenUrl = resultado.secure_url;
      imagenPublicId = resultado.public_id;
    }

    const publicacion = await this.publicacionesRepository.crear(
      dto,
      imagenUrl,
      imagenPublicId,
    );

    return this.sanitizar(publicacion);
  }

  async listar(query: ListarPublicacionesDto) {
    const [publicaciones, total] = await Promise.all([
      this.publicacionesRepository.listar(query),
      this.publicacionesRepository.contarTotal(query),
    ]);

    return {
      data: publicaciones.map((p: any) => {
        const { _id, __v, ...resto } = p;
        // limpiar también el _id del usuario populado
        if (resto.usuario && resto.usuario._id) {
          resto.usuario = {
            id: resto.usuario._id.toString(),
            nombre: resto.usuario.nombre,
            apellido: resto.usuario.apellido,
            nombreUsuario: resto.usuario.nombreUsuario,
            fotoPerfil: resto.usuario.fotoPerfil,
          };
        }
        return { id: _id?.toString(), ...resto };
      }),
      total,
      offset: query.offset ?? 0,
      limit: query.limit ?? 10,
    };
  }

  async eliminar(id: string, usuarioId: string, perfil: string) {
    const publicacion = await this.publicacionesRepository.buscarPorId(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // después del populate, usuario es un objeto — accedemos a _id
    const creadorId = (publicacion.usuario as any)._id?.toString()
      ?? publicacion.usuario.toString();

    const esCreador = creadorId === usuarioId;
    const esAdmin = perfil === 'administrador';

    if (!esCreador && !esAdmin) {
      throw new ForbiddenException('No tenés permiso para eliminar esta publicación');
    }

    await this.publicacionesRepository.bajaLogica(id);
    return { mensaje: 'Publicación eliminada correctamente' };
  }

  async darLike(publicacionId: string, usuarioId: string) {
    const publicacion =
      await this.publicacionesRepository.buscarPorId(publicacionId);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // un usuario no puede darse like a sí mismo
    if (publicacion.usuario.toString() === usuarioId) {
      throw new BadRequestException(
        'No podés darle like a tu propia publicación',
      );
    }

    const yaLikeo = await this.publicacionesRepository.tieneLike(
      publicacionId,
      usuarioId,
    );
    if (yaLikeo) {
      throw new BadRequestException('Ya le diste like a esta publicación');
    }

    await this.publicacionesRepository.agregarLike(publicacionId, usuarioId);
    return { mensaje: 'Like agregado correctamente' };
  }

  async quitarLike(publicacionId: string, usuarioId: string) {
    const publicacion =
      await this.publicacionesRepository.buscarPorId(publicacionId);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const tieneLike = await this.publicacionesRepository.tieneLike(
      publicacionId,
      usuarioId,
    );
    if (!tieneLike) {
      throw new BadRequestException(
        'No le habías dado like a esta publicación',
      );
    }

    await this.publicacionesRepository.quitarLike(publicacionId, usuarioId);
    return { mensaje: 'Like eliminado correctamente' };
  }

  private sanitizar(publicacion: any) {
    const obj = publicacion.toObject
      ? publicacion.toObject({ virtuals: true })
      : publicacion;
    const { _id, __v, ...resto } = obj;
    return resto;
  }
}
