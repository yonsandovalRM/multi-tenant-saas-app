import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class BusinessDay {
  @Prop({ required: true })
  isOpen: boolean;

  @Prop({ required: true })
  start: string;

  @Prop({ required: true })
  end: string;
}

// Definir una clase para las horas comerciales
class BusinessHours {
  @Prop({ type: BusinessDay })
  monday: BusinessDay;

  @Prop({ type: BusinessDay })
  tuesday: BusinessDay;

  @Prop({ type: BusinessDay })
  wednesday: BusinessDay;

  @Prop({ type: BusinessDay })
  thursday: BusinessDay;

  @Prop({ type: BusinessDay })
  friday: BusinessDay;

  @Prop({ type: BusinessDay })
  saturday: BusinessDay;

  @Prop({ type: BusinessDay })
  sunday: BusinessDay;
}

class BusinessConfig {
  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  timezone: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  decimals: number;
}

class BookingSettings {
  @Prop({ required: true })
  advancedBookingDays: number;

  @Prop({ required: true })
  cancellationHours: number;

  @Prop({ required: true })
  confirmationRequired: boolean;
}

@Schema({ timestamps: true })
export class Company extends Document {
  @Prop({ required: true, unique: true, index: true })
  businessName: string;

  @Prop({ required: true, unique: true, index: true })
  taxId: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  logo?: string;

  @Prop()
  cover?: string;

  @Prop()
  website?: string;

  @Prop({
    type: BusinessConfig,
    required: true,
    default: {
      currency: 'CLP',
      timezone: 'America/Santiago',
      language: 'es',
      decimals: 0,
    },
  })
  configs: BusinessConfig;

  @Prop({
    type: BusinessHours,
    required: true,
    default: {
      monday: { isOpen: true, start: '09:00', end: '18:00' },
      tuesday: { isOpen: true, start: '09:00', end: '18:00' },
      wednesday: { isOpen: true, start: '09:00', end: '18:00' },
      thursday: { isOpen: true, start: '09:00', end: '18:00' },
      friday: { isOpen: true, start: '09:00', end: '18:00' },
      saturday: { isOpen: true, start: '09:00', end: '18:00' },
      sunday: { isOpen: false, start: '09:00', end: '18:00' },
    },
  })
  businessHours: BusinessHours;

  @Prop({
    type: BookingSettings,
    required: true,
    default: {
      advancedBookingDays: 30,
      cancellationHours: 24,
      confirmationRequired: false,
    },
  })
  bookingSettings: BookingSettings;

  @Prop()
  deleteAt?: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
