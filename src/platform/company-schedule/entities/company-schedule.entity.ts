import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Company } from '../../companies/entities/company.entity';

@Schema({ timestamps: true })
export class CompanySchedule extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company', required: true })
  company: Company;

  @Prop({ required: true })
  dayOfWeek: number;

  @Prop({ required: true })
  start: string;

  @Prop({ required: true })
  end: string;

  @Prop()
  breakStart?: string;

  @Prop()
  breakEnd?: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const CompanyScheduleSchema =
  SchemaFactory.createForClass(CompanySchedule);
