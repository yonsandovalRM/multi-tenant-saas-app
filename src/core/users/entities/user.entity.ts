import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  PROFESSIONAL = 'professional',
  USER = 'user',
  RECEPTIONIST = 'receptionist',
  ADMIN = 'admin',
}

class ProfessionalSettings {
  @Prop()
  title: string;

  @Prop()
  specialty: string;

  @Prop()
  description: string;

  @Prop()
  color: string;
}

const ProfessionalSettingsSchema =
  SchemaFactory.createForClass(ProfessionalSettings);

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phone: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  // Nuevo campo para identificar usuarios core vs tenant
  @Prop({ default: false })
  isCoreUser: boolean;

  // ID del tenant al que pertenece (null para usuarios core)
  @Prop({ default: null })
  tenantId: string;

  // Para profesionales
  @Prop({ type: ProfessionalSettingsSchema })
  professionalSettings?: ProfessionalSettings;
}

export const UserSchema = SchemaFactory.createForClass(User);
