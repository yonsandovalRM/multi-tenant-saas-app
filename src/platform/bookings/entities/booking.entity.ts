import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ required: true, ref: 'User' })
  clientId: Types.ObjectId; // usuario que hace la reserva

  @Prop({ required: true, ref: 'User' })
  professionalId: Types.ObjectId;

  @Prop({ required: true, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop()
  notes: string; // notas del cliente o profesional

  @Prop()
  internalNotes: string; // notas internas (solo staff)

  @Prop({ required: true })
  price: number; // precio al momento de la reserva

  @Prop()
  cancellationReason?: string;

  @Prop()
  cancelledBy?: Types.ObjectId; // referencia al usuario que canceló

  @Prop()
  cancelledAt?: Date;

  @Prop({ ref: 'User' })
  createdBy: Types.ObjectId; // quien creó la reserva (cliente, recepcionista, etc.)

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
