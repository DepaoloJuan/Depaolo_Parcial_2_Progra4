import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({
  timestamps: true,
  collection: 'publicaciones',
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret: any) => {
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

  @Prop({ default: '' })
  imagenUrl!: string;

  @Prop({ default: '' })
  imagenPublicId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario!: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  likes!: Types.ObjectId[];

  @Prop({ default: true })
  activo!: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

// índices para optimizar las consultas más frecuentes
PublicacionSchema.index({ createdAt: -1 });
PublicacionSchema.index({ usuario: 1 });
PublicacionSchema.index({ likes: 1 });
