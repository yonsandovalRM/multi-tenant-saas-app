import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  Matches,
} from 'class-validator';
import { ScheduleType } from '../entities/professional-schedule.entity';

export class TimeBlockDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'start must be in HH:mm format',
  })
  start: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'end must be in HH:mm format',
  })
  end: string;
}

export class BusinessDayDto {
  @IsBoolean()
  @IsOptional()
  isWorking?: boolean;

  @IsEnum(ScheduleType)
  @IsOptional()
  type?: ScheduleType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeBlockDto)
  @IsOptional()
  blocks?: TimeBlockDto[];
}

export class WeekScheduleDto {
  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  monday?: BusinessDayDto;

  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  tuesday?: BusinessDayDto;

  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  wednesday?: BusinessDayDto;

  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  thursday?: BusinessDayDto;

  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  friday?: BusinessDayDto;

  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  saturday?: BusinessDayDto;

  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  sunday?: BusinessDayDto;
}

export class CreateProfessionalScheduleDto {
  @IsString()
  @IsNotEmpty()
  professionalId: string;

  @ValidateNested()
  @Type(() => WeekScheduleDto)
  @IsOptional()
  schedule?: WeekScheduleDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
