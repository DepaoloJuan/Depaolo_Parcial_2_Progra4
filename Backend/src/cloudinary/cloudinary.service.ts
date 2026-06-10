import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async subirImagen(
    archivo: Express.Multer.File,
    carpeta: string = 'usuarios',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: carpeta,
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, resultado) => {
          if (error) {
            return reject(
              new BadRequestException(
                `Error al subir imagen a Cloudinary: ${error.message}`,
              ),
            );
          }
          resolve(resultado!);
        },
      );

      const readable = new Readable();
      readable.push(archivo.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async eliminarImagen(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
