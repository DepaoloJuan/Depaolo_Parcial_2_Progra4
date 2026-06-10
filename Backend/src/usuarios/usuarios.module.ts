import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { UsuariosRepository } from './usuarios.repository';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';

@Module({
  imports: [
    // forFeature registra el schema en este módulo específico
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuariosRepository],
  // exportamos el service para que AutenticacionModule pueda usarlo
  exports: [UsuariosService],
})
export class UsuariosModule {}