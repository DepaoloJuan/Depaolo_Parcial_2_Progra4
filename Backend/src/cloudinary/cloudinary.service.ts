import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Servicio para interactuar con la API de Cloudinary.
 * Maneja la subida y eliminación de imágenes usando el SDK v2.
 */
@Injectable()
export class CloudinaryService {
  /**
   * Sube un archivo de imagen a Cloudinary mediante un stream en memoria.
   *
   * Se usa upload_stream (en lugar de upload) porque Multer guardó el archivo
   * en RAM (memoryStorage), así que disponemos de un Buffer, no de una ruta en disco.
   * El proceso es: Buffer → Readable stream → upload_stream de Cloudinary.
   *
   * Transformaciones aplicadas en la nube:
   *   - crop 'limit' 800×800: reduce la imagen si supera ese tamaño, sin estirar.
   *   - quality 'auto:good': compresión automática con buena calidad visual.
   *   - fetch_format 'auto': sirve WebP a navegadores que lo soportan, JPEG al resto.
   *
   * @param archivo  Archivo recibido por Multer (con el buffer en archivo.buffer).
   * @param carpeta  Subcarpeta en Cloudinary donde se almacenará ('perfiles' o 'publicaciones').
   * @returns        Respuesta de Cloudinary con secure_url y public_id, entre otros.
   */
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

      // Envolvemos el Buffer en un Readable y lo conectamos al stream de subida
      const readable = new Readable();
      readable.push(archivo.buffer);
      readable.push(null);   // señal de fin de stream
      readable.pipe(uploadStream);
    });
  }

  /**
   * Elimina una imagen de Cloudinary por su public_id.
   * Se puede usar en el futuro al borrar publicaciones o cambiar la foto de perfil.
   */
  async eliminarImagen(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
