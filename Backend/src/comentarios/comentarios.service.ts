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

  // usuarioId llega separado del DTO — extraído del token en el controller
  async crear(dto: CrearComentarioDto, usuarioId: string) {
    return this.comentariosRepository.crear(dto, usuarioId);
  }

  async actualizar(id: string, dto: ActualizarComentarioDto, usuarioId: string) {
    const comentario = await this.comentariosRepository.buscarPorId(id);

    if (!comentario) throw new NotFoundException('Comentario no encontrado');

    // Verificamos que quien edita sea el autor — la consigna dice "el usuario que lo escribió"
    if (comentario.usuarioId.toString() !== usuarioId) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    return this.comentariosRepository.actualizar(id, dto.mensaje);
  }

  async listarPorPublicacion(publicacionId: string, offset = 0, limit = 5) {
    const { comentarios, total } = await this.comentariosRepository.listarPorPublicacion(
      publicacionId,
      offset,
      limit,
    );

    return {
      comentarios,
      total,
      offset,
      limit,
      // hayMas le dice al frontend si tiene sentido mostrar el botón "cargar más"
      hayMas: offset + limit < total,
    };
  }
}
