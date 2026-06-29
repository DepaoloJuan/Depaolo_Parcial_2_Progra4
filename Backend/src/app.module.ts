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

/**
 * Módulo raíz de la aplicación.
 * Registra la configuración global, la conexión a MongoDB y los módulos de negocio.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,   // no hace falta importarlo en cada módulo
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        // connectionFactory permite enganchar eventos del ciclo de vida de la conexión
        connectionFactory: (connection) => {
          connection.on('connected', () =>
            console.log('✅ MongoDB conectado exitosamente'),
          );
          connection.on('error', (err: Error) =>
            console.log('❌ Error en conexión MongoDB:', err),
          );
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
  controllers: [],
  providers: [
    // Registramos los guards globalmente — se aplican a TODAS las rutas
    // El orden importa: primero JWT, después Roles
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
