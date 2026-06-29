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

/**
 * Lógica de negocio para publicaciones.
 * Aplica reglas de autorización (quién puede borrar), validaciones de negocio
 * (no self-like, no like duplicado) y formatea las respuestas al cliente.
 */
@Injectable()
export class PublicacionesService {
  constructor(
    private readonly publicacionesRepository: PublicacionesRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Crea una publicación. Si viene imagen, la sube a Cloudinary primero.
   * @returns La publicación persistida sin _id ni __v internos.
   */
  async crear(dto: CrearPublicacionDto, imagen?: Express.Multer.File) {
    let imagenUrl = '';
    let imagenPublicId = '';

    if (imagen) {
      const resultado = await this.cloudinaryService.subirImagen(imagen, 'publicaciones');
      imagenUrl = resultado.secure_url;
      imagenPublicId = resultado.public_id;   // guardamos el ID para poder eliminarla luego
    }

    const publicacion = await this.publicacionesRepository.crear(dto, imagenUrl, imagenPublicId);
    return this.sanitizar(publicacion);
  }

  /**
   * Lista publicaciones con paginación y ordenamiento.
   * Ejecuta la consulta y el conteo total en paralelo con Promise.all para reducir latencia.
   * Normaliza los datos del usuario populado antes de devolverlos al cliente.
   */
  async listar(query: ListarPublicacionesDto) {
    const [publicaciones, total] = await Promise.all([
      this.publicacionesRepository.listar(query),
      this.publicacionesRepository.contarTotal(query),
    ]);

    return {
      data: publicaciones.map((p: any) => {
        const { _id, __v, ...resto } = p;

        // El populate devuelve el subdocumento usuario con _id; lo mapeamos a "id"
        // para que sea consistente con el resto de la API
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

  /**
   * Elimina lógicamente una publicación.
   * Solo el creador o un administrador pueden borrarla (autorización manual,
   * sin JWT en esta versión de la app).
   *
   * Nota: después del populate, publicacion.usuario es un objeto, no un ObjectId;
   * por eso se accede a ._id antes de comparar con el usuarioId del query.
   */
  async eliminar(id: string, usuarioId: string, perfil: string) {
    const publicacion = await this.publicacionesRepository.buscarPorId(id);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

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

  /**
   * Agrega un like a la publicación.
   * Valida que el usuario no sea el autor (no self-like) y que no haya likeado ya.
   */
  async darLike(publicacionId: string, usuarioId: string) {
    const publicacion = await this.publicacionesRepository.buscarPorId(publicacionId);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    // publicacion.usuario puede ser ObjectId o el objeto populado según el contexto
    if (publicacion.usuario.toString() === usuarioId) {
      throw new BadRequestException('No podés darle like a tu propia publicación');
    }

    const yaLikeo = await this.publicacionesRepository.tieneLike(publicacionId, usuarioId);
    if (yaLikeo) {
      throw new BadRequestException('Ya le diste like a esta publicación');
    }

    await this.publicacionesRepository.agregarLike(publicacionId, usuarioId);
    return { mensaje: 'Like agregado correctamente' };
  }

  /** Quita el like de un usuario. Lanza 400 si el usuario no había dado like. */
  async quitarLike(publicacionId: string, usuarioId: string) {
    const publicacion = await this.publicacionesRepository.buscarPorId(publicacionId);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');

    const tieneLike = await this.publicacionesRepository.tieneLike(publicacionId, usuarioId);
    if (!tieneLike) {
      throw new BadRequestException('No le habías dado like a esta publicación');
    }

    await this.publicacionesRepository.quitarLike(publicacionId, usuarioId);
    return { mensaje: 'Like eliminado correctamente' };
  }

  async obtenerPorId(id: string) {
    const publicacion = await this.publicacionesRepository.buscarPorId(id);
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return publicacion;
  }

  private sanitizar(publicacion: any) {
    const obj = publicacion.toObject
      ? publicacion.toObject({ virtuals: true })
      : publicacion;
    const { _id, __v, ...resto } = obj;
    return resto;
  }
}
