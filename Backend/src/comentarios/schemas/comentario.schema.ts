import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ComentarioDocument = Comentario & Document;

// timestamps: true → Mongoose agrega createdAt y updatedAt automáticamente en cada documento
@Schema({ timestamps: true })
export class Comentario {
  // ObjectId referenciando a la publicación — permite hacer populate() para traer sus datos
  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true })
  publicacionId!: Types.ObjectId;

  // ObjectId referenciando al usuario autor — populate() en listar trae nombreUsuario y fotoPerfil
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuarioId!: Types.ObjectId;

  @Prop({ required: true })
  mensaje!: string;

  // Se pone en true cuando el usuario edita el comentario; el frontend lo muestra como "(editado)"
  @Prop({ default: false })
  modificado!: boolean;

  // Baja lógica: los comentarios nunca se eliminan físicamente de la DB
  @Prop({ default: true })
  activo!: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
