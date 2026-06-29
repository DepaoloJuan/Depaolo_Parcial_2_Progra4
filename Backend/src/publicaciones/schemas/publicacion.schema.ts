import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** Tipo hidratado que incluye los métodos de Mongoose sobre el modelo Publicacion. */
export type PublicacionDocument = HydratedDocument<Publicacion>;

/**
 * Esquema de Mongoose para la colección "publicaciones".
 *
 * - timestamps: agrega createdAt / updatedAt automáticamente.
 * - toJSON.transform: expone "id" (virtual) y oculta "_id" y "__v" en las respuestas.
 */
@Schema({
  timestamps: true,
  collection: 'publicaciones',
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Publicacion {
  @Prop({ required: true, trim: true })
  titulo!: string;

  @Prop({ required: true, trim: true })
  descripcion!: string;

  /** URL pública de Cloudinary. Vacío si la publicación no tiene imagen. */
  @Prop({ default: '' })
  imagenUrl!: string;

  /**
   * public_id de Cloudinary, necesario para poder eliminar la imagen
   * al borrar la publicación (si se implementa en el futuro).
   */
  @Prop({ default: '' })
  imagenPublicId!: string;

  /** Referencia al usuario autor. Se pobla vía populate() en las consultas de listado. */
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario!: Types.ObjectId;

  /**
   * Array de IDs de usuarios que dieron like.
   * Se usa $addToSet para agregar (sin duplicados) y $pull para quitar.
   */
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  likes!: Types.ObjectId[];

  /** Flag de baja lógica: false = publicación eliminada, no visible en listados. */
  @Prop({ default: true })
  activo!: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

// Índices para optimizar las consultas más frecuentes:
// - createdAt: ordenamiento por fecha (caso por defecto del listado)
// - usuario: filtrar publicaciones de un usuario en mi-perfil
// - likes: conteo y búsqueda de likes
PublicacionSchema.index({ createdAt: -1 });
PublicacionSchema.index({ usuario: 1 });
PublicacionSchema.index({ likes: 1 });
