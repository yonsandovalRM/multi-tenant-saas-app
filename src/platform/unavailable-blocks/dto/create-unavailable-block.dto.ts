import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsBoolean,
  ValidateNested,
  ValidateIf,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UnavailableType } from '../entities/unavailable-block.entity';

export class RecurrencePatternDto {
  @IsEnum(['daily', 'weekly', 'monthly'])
  frequency: 'daily' | 'weekly' | 'monthly';

  @IsNumber()
  @Min(1)
  interval: number;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateUnavailableBlockDto {
  @IsString()
  @IsNotEmpty()
  professionalId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(UnavailableType)
  type: UnavailableType;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ValidateIf((o) => o.isRecurring === true)
  @ValidateNested()
  @Type(() => RecurrencePatternDto)
  recurrencePattern?: RecurrencePatternDto;
}
