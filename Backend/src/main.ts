import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // prefijo global para todas las rutas: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // pipe global de validación — igual al que usa el docente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true,   // si llegan campos extra, lanza 400
      transform: true,              // activa class-transformer
      transformOptions: {
        enableImplicitConversion: true, // convierte tipos automáticamente
      },
    }),
  );

  // CORS — permite que Angular (localhost:4200) se comunique con este servidor
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://depaolo-parcial-2-progra4.vercel.app', // tu URL de Vercel
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Servidor corriendo en: http://localhost:3000/api/v1`);
}

bootstrap();