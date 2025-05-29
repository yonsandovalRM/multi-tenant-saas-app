import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AvailabilityQueryDto {
  @IsString()
  @IsNotEmpty()
  professionalId: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  serviceId?: string;
}

export class MultipleAvailabilityQueryDto {
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  professionalIds: string[];

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  serviceId?: string;
}

export class AvailabilityRangeQueryDto {
  @IsString()
  @IsNotEmpty()
  professionalId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  serviceId?: string;
}
