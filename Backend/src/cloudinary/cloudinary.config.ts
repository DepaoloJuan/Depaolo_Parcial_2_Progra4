import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

/**
 * Provider de NestJS que configura el SDK de Cloudinary con las credenciales del .env.
 * Se registra en CloudinaryModule y queda disponible para inyectar el token 'CLOUDINARY'
 * en cualquier servicio que lo necesite.
 */
export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  },
  inject: [ConfigService],
};
