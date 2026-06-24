import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * HydratedDocument agrega al tipo Usuario todos los métodos de Mongoose
 * (save, deleteOne, etc.) más los campos _id, createdAt, updatedAt.
 */
export type UsuarioDocument = HydratedDocument<Usuario>;

/**
 * Esquema de Mongoose para la colección "usuarios".
 *
 * - timestamps: agrega createdAt / updatedAt automáticamente.
 * - toJSON.transform: limpia _id y __v del JSON de respuesta para que la
 *   API devuelva únicamente el campo virtual "id" (generado por Mongoose).
 */
@Schema({
  timestamps: true,
  collection: 'usuarios',
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
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre!: string;

  @Prop({ required: true, trim: true })
  apellido!: string;

  /** Se guarda siempre en minúsculas para búsquedas case-insensitive. */
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo!: string;

  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario!: string;

  /** Almacenado como hash bcrypt — nunca se devuelve en las respuestas. */
  @Prop({ required: true })
  contrasenia!: string;

  @Prop({ required: true })
  fechaNacimiento!: Date;

  @Prop({ trim: true, default: '' })
  descripcion!: string;

  /** URL pública de Cloudinary. Vacío si el usuario no cargó foto. */
  @Prop({ default: '' })
  fotoPerfil!: string;

  @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil!: string;

  /** Flag de baja lógica: false = cuenta deshabilitada, no se elimina el documento. */
  @Prop({ default: true })
  activo!: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
