import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @IsString()
  @IsOptional()
  cancelledBy?: string;

  @IsDateString()
  @IsOptional()
  cancelledAt?: string;
}
