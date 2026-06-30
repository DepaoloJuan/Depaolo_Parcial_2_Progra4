import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesRepository } from './publicaciones.repository';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { EstadisticasController } from './estadisticas/estadisticas.controller';
import { EstadisticasService } from './estadisticas/estadisticas.service';
import { Comentario, ComentarioSchema } from '../comentarios/schemas/comentario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [PublicacionesController, EstadisticasController],
  providers: [PublicacionesService, PublicacionesRepository, EstadisticasService],
  exports: [PublicacionesService],
})
export class PublicacionesModule {}
