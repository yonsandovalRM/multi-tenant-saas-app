import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UnavailableType {
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave',
  PERSONAL = 'personal',
  BREAK = 'break',
  CUSTOM = 'custom',
}

class RecurrencePattern {
  @Prop({ required: true })
  frequency: 'daily' | 'weekly' | 'monthly';

  @Prop({ required: true })
  interval: number; // cada cuántos días/semanas/meses

  @Prop()
  endDate?: Date;
}

const RecurrencePatternSchema = SchemaFactory.createForClass(RecurrencePattern);

@Schema({ timestamps: true })
export class UnavailableBlock extends Document {
  @Prop({ required: true, ref: 'User' })
  professionalId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, enum: UnavailableType })
  type: UnavailableType;

  @Prop()
  reason: string;

  @Prop({ default: false })
  isRecurring: boolean; // para bloques que se repiten

  @Prop({ type: RecurrencePatternSchema })
  recurrencePattern?: RecurrencePattern;
}

export const UnavailableBlockSchema =
  SchemaFactory.createForClass(UnavailableBlock);
