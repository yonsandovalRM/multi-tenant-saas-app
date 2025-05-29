import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AvailabilitySlotDto {
  startTime: string;
  endTime: string;
  startDate: Date;
  endDate: Date;
  isAvailable: boolean;
}

export class ProfessionalAvailabilityDto {
  professionalId: string;
  date: string;
  slots: AvailabilitySlotDto[];
}

export class NextSlotsQueryDto {
  @IsString()
  @IsNotEmpty()
  professionalId: string;

  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  limit?: number = 10;
}
