import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';

/**
 * Módulo raíz de la aplicación.
 * Registra la configuración global, la conexión a MongoDB y los módulos de negocio.
 */
@Module({
  imports: [
    // ConfigModule hace disponibles las variables de .env en toda la app via ConfigService
    ConfigModule.forRoot({
      isGlobal: true,   // no hace falta importarlo en cada módulo
      envFilePath: '.env',
    }),

    // MongooseModule.forRootAsync espera a que ConfigModule cargue el .env
    // antes de intentar conectar a MongoDB Atlas
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
