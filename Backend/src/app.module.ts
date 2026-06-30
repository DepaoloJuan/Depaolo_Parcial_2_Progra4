import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { JwtAuthGuard } from './autenticacion/guards/jwt-auth.guard';
import { RolesGuard } from './autenticacion/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,    // disponible en todos los módulos sin necesidad de importarlo de nuevo
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          connection.on('connected', () => console.log('✅ MongoDB conectado exitosamente'));
          connection.on('error', (err: Error) => console.log('❌ Error en conexión MongoDB:', err));
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    UsuariosModule,
    AutenticacionModule,
    PublicacionesModule,
    ComentariosModule,
  ],
  providers: [
    // APP_GUARD registra los guards globalmente — se aplican a TODAS las rutas de la app
    // El orden importa: JwtAuthGuard se ejecuta primero (verifica el token),
    // luego RolesGuard (verifica que el perfil tenga permisos)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
