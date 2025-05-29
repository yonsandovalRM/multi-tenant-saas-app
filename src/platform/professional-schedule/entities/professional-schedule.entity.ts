import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ScheduleType {
  FULL_TIME = 'full_time',
  CUSTOM_BLOCKS = 'custom_blocks',
}

class TimeBlock {
  @Prop({ required: true })
  start: string; // formato HH:mm

  @Prop({ required: true })
  end: string; // formato HH:mm
}

class BusinessDay {
  @Prop({ required: true, default: false })
  isWorking: boolean;

  @Prop({ required: true, enum: ScheduleType, default: ScheduleType.FULL_TIME })
  type: ScheduleType;

  @Prop({ type: [TimeBlock], default: [] })
  blocks: TimeBlock[];
}

class WeekSchedule {
  @Prop({ type: BusinessDay, required: true })
  monday: BusinessDay;

  @Prop({ type: BusinessDay, required: true })
  tuesday: BusinessDay;

  @Prop({ type: BusinessDay, required: true })
  wednesday: BusinessDay;

  @Prop({ type: BusinessDay, required: true })
  thursday: BusinessDay;

  @Prop({ type: BusinessDay, required: true })
  friday: BusinessDay;

  @Prop({ type: BusinessDay, required: true })
  saturday: BusinessDay;

  @Prop({ type: BusinessDay, required: true })
  sunday: BusinessDay;
}

@Schema({ timestamps: true })
export class ProfessionalSchedule extends Document {
  @Prop({ required: true, ref: 'User', index: true })
  professionalId: Types.ObjectId;

  @Prop({
    required: true,
    type: WeekSchedule,
    default: () => ({
      monday: { isWorking: true, type: ScheduleType.FULL_TIME, blocks: [] },
      tuesday: { isWorking: true, type: ScheduleType.FULL_TIME, blocks: [] },
      wednesday: { isWorking: true, type: ScheduleType.FULL_TIME, blocks: [] },
      thursday: { isWorking: true, type: ScheduleType.FULL_TIME, blocks: [] },
      friday: { isWorking: true, type: ScheduleType.FULL_TIME, blocks: [] },
      saturday: { isWorking: true, type: ScheduleType.FULL_TIME, blocks: [] },
      sunday: { isWorking: false, type: ScheduleType.FULL_TIME, blocks: [] },
    }),
  })
  schedule: WeekSchedule;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  deleteAt?: Date;
}

export const ProfessionalScheduleSchema =
  SchemaFactory.createForClass(ProfessionalSchedule);
