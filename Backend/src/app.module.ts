import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';

@Module({
  imports: [
    // ConfigModule lee el .env y lo hace disponible en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongooseModule conecta a MongoDB Atlas
    // forRootAsync espera a que ConfigModule esté listo antes de conectar
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          connection.on('connected', () =>
            console.log('✅ MongoDB conectado exitosamente'),
          );
          connection.on('error', (err) =>
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