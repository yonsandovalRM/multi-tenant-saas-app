import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'user' })
  role: string;

  // Nuevo campo para identificar usuarios core vs tenant
  @Prop({ default: false })
  isCoreUser: boolean;

  // ID del tenant al que pertenece (null para usuarios core)
  @Prop({ default: null })
  tenantId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
