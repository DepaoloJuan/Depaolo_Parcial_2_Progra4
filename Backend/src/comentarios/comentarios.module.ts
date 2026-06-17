import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';
import { ComentariosRepository } from './comentarios.repository';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';

@Module({
  imports: [
    // Registramos el schema de Comentario para que Mongoose lo conozca
    MongooseModule.forFeature([
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService, ComentariosRepository],
  exports: [ComentariosService], // lo exportamos por si PublicacionesModule lo necesita
})
export class ComentariosModule {}
