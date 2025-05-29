import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProfessionalService extends Document {
  @Prop({ required: true, ref: 'User' })
  professionalId: Types.ObjectId;

  @Prop({ required: true, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop()
  customPrice?: number; // precio específico del profesional para este servicio

  @Prop()
  customDuration?: number; // duración específica del profesional

  @Prop({ default: true })
  isActive: boolean;
}

export const ProfessionalServiceSchema =
  SchemaFactory.createForClass(ProfessionalService);
