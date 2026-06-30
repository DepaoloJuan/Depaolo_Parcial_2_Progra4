import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    UsuariosModule,    // necesitamos validarCredenciales() y buscarPorId() del UsuariosService
    CloudinaryModule,  // necesitamos subirImagen() para la foto de perfil en el registro
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // registerAsync permite leer variables de entorno asíncronamente con ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' }, // el token vence a los 15 minutos — consigna sprint-3
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AutenticacionController],
  providers: [
    AutenticacionService,
    JwtStrategy, // registramos la strategy para que Passport la encuentre por nombre 'jwt'
  ],
  exports: [AutenticacionService, JwtModule], // JwtModule se exporta para que otros módulos usen JwtService si lo necesitan
})
export class AutenticacionModule {}
