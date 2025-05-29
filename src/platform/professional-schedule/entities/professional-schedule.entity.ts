import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ScheduleType {
  FULL_TIME = 'full_time',
  CUSTOM_BLOCKS = 'custom_blocks',
}
// Para FULL_TIME usa horario de empresa
// Para CUSTOM_BLOCKS usa estos bloques

class BusinessDay {
  @Prop({ required: true })
  isWorking: boolean;

  @Prop({ required: true, enum: ScheduleType })
  type: ScheduleType;

  @Prop()
  blocks?: Array<{ start: string; end: string }>;
}

class ScheduleDay {
  @Prop({ required: true, type: BusinessDay })
  monday: BusinessDay;
}

@Schema({ timestamps: true })
export class ProfessionalSchedule extends Document {
  @Prop({ required: true, ref: 'User' })
  professionalId: Types.ObjectId;

  @Prop({ required: true, enum: ScheduleType })
  type: ScheduleType;

  @Prop({
    required: true,
    type: ScheduleDay,
    default: {
      monday: {
        isWorking: true,
        type: ScheduleType.FULL_TIME,
      },
      tuesday: {
        isWorking: true,
        type: ScheduleType.FULL_TIME,
      },
      wednesday: {
        isWorking: true,
        type: ScheduleType.FULL_TIME,
      },
      thursday: {
        isWorking: true,
        type: ScheduleType.FULL_TIME,
      },
      friday: {
        isWorking: true,
        type: ScheduleType.FULL_TIME,
      },
      saturday: {
        isWorking: true,
        type: ScheduleType.FULL_TIME,
      },
      sunday: {
        isWorking: false,
        type: ScheduleType.FULL_TIME,
      },
    },
  })
  schedule: ScheduleDay;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProfessionalScheduleSchema =
  SchemaFactory.createForClass(ProfessionalSchedule);
