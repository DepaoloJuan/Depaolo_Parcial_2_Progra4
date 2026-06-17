import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ComentariosRepository } from './comentarios.repository';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ActualizarComentarioDto } from './dto/actualizar-comentario.dto';

@Injectable()
export class ComentariosService {
  constructor(private readonly comentariosRepository: ComentariosRepository) {}

  // Crea un nuevo comentario
  async crear(dto: CrearComentarioDto) {
    return this.comentariosRepository.crear(dto);
  }

  // Modifica el mensaje de un comentario propio
  async actualizar(
    id: string,
    dto: ActualizarComentarioDto,
    usuarioId: string,
  ) {
    // Primero verificamos que el comentario existe
    const comentario = await this.comentariosRepository.buscarPorId(id);

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    // Verificamos que el comentario pertenece al usuario que quiere editarlo
    if (comentario.usuarioId.toString() !== usuarioId) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    return this.comentariosRepository.actualizar(id, dto.mensaje);
  }

  // Lista comentarios de una publicación con paginación
  async listarPorPublicacion(
    publicacionId: string,
    offset: number = 0,
    limit: number = 5,
  ) {
    const { comentarios, total } =
      await this.comentariosRepository.listarPorPublicacion(
        publicacionId,
        offset,
        limit,
      );

    return {
      comentarios,
      total,
      offset,
      limit,
      // Le decimos al frontend si hay más comentarios para cargar
      hayMas: offset + limit < total,
    };
  }
}
