import { Module } from '@nestjs/common';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    // importamos UsuariosModule para poder usar UsuariosService
    // esto funciona porque UsuariosModule exporta UsuariosService
    UsuariosModule,
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
})
export class AutenticacionModule {}