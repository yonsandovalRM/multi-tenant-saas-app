import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Tenant extends Document {
  @Prop({ required: true, unique: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
