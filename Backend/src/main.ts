import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap de la aplicación NestJS.
 * Configura el prefijo global de rutas, la validación de DTOs y CORS.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Todas las rutas quedan bajo /api/v1/ (ej: /api/v1/autenticacion/login)
  app.setGlobalPrefix('api/v1');

  // ValidationPipe global: valida el body de cada request contra los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true,   // si llegan propiedades extra, responde 400
      transform: true,              // convierte el body al tipo del DTO (class-transformer)
      transformOptions: {
        enableImplicitConversion: true, // convierte strings a number/boolean según el tipo
      },
    }),
  );

  // CORS: solo permite peticiones desde el frontend Angular (local y producción)
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://depaolo-parcial-2-progra4.vercel.app',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Servidor corriendo en: http://localhost:3000/api/v1`);
}

bootstrap();
