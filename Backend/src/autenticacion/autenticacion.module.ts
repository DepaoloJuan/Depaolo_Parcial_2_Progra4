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
    // Necesitamos acceso a UsuariosModule para validar credenciales
    UsuariosModule,
    // Necesitamos CloudinaryModule para subir fotos de perfil en registro
    CloudinaryModule,
    // Passport con JWT como estrategia por defecto
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule configurado de forma asíncrona para poder leer el .env
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' }, // el token vence en 15 minutos
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AutenticacionController],
  providers: [
    AutenticacionService,
    JwtStrategy, // registramos la strategy para que Passport la encuentre
  ],
  // Exportamos JwtModule para que otros módulos puedan usar JwtService si lo necesitan
  exports: [AutenticacionService, JwtModule],
})
export class AutenticacionModule {}
