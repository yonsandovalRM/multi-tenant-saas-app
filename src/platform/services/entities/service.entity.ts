import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  duration: number; // en minutos

  @Prop({ required: true })
  price: number;

  @Prop()
  category: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  color: string; // para visualización en calendario

  @Prop()
  bufferTime: number; // tiempo de limpieza/preparación después del servicio
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
