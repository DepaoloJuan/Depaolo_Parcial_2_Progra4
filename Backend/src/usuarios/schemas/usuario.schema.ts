import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// HydratedDocument es el tipo que representa un documento de MongoDB
// con todos los métodos de Mongoose (save, delete, etc.)
export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({
  timestamps: true,        // agrega createdAt y updatedAt automáticamente
  collection: 'usuarios',
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret: any) => {
      delete ret._id;      // limpia _id del JSON de respuesta
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

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo!: string;

  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario!: string;

  @Prop({ required: true, select: false })
  contrasenia!: string;

  @Prop({ required: true })
  fechaNacimiento!: Date;

  @Prop({ trim: true, default: '' })
  descripcion!: string;

  @Prop({ default: '' })
  fotoPerfil!: string;  // URL de Cloudinary

  @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil!: string;

  @Prop({ default: true })
  activo!: boolean;     // para la baja lógica del sprint 4
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);