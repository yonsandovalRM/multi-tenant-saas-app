import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PlanName {
  BASIC = 'Básico',
  PRO = 'Profesional',
  ENTERPRISE = 'Empresarial',
}

@Schema({ timestamps: true })
export class Plan extends Document {
  @Prop({
    required: true,
    enum: Object.values(PlanName),
    unique: true,
  })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: [String] })
  features: string[];

  @Prop({ required: true })
  price: number;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
