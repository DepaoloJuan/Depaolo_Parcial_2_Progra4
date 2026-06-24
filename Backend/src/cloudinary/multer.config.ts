import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Configuración de Multer compartida por todos los endpoints que reciben imágenes.
 *
 * - storage: memoryStorage guarda el archivo en RAM (archivo.buffer) en lugar de disco,
 *   lo que facilita pasarlo directamente al stream de Cloudinary sin archivos temporales.
 * - limits.fileSize: rechaza archivos mayores a 5 MB antes de procesarlos.
 * - fileFilter: valida el MIME type; si no está permitido lanza 400 inmediatamente.
 */
export const multerConfig = {
  storage: memoryStorage(),
  limits: {
    fileSize: TAMANO_MAXIMO_BYTES,
  },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `Tipo de archivo no permitido: ${file.mimetype}. Se aceptan: jpg, png, webp`,
        ),
        false,
      );
    }
    callback(null, true);
  },
};
