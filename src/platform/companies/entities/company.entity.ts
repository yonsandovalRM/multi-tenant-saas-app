import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Company extends Document {
  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
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
    type: Map,
    of: String,
    default: {
      currency: 'CLP',
      timezone: 'America/Santiago',
      language: 'es',
      decimals: 0,
    },
  })
  configs: Map<string, string>;

  @Prop()
  deleteAt?: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
