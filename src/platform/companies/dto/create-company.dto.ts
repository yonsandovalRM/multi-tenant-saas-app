import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// DTO para BusinessDay
export class BusinessDayDto {
  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;

  @IsString()
  @IsOptional()
  start?: string;

  @IsString()
  @IsOptional()
  end?: string;
}

// DTO para BusinessHours
export class BusinessHoursDto {
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

// DTO para BusinessConfig
export class BusinessConfigDto {
  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsNumber()
  @IsOptional()
  decimals?: number;
}

// DTO para BookingSettings
export class BookingSettingsDto {
  @IsNumber()
  @IsOptional()
  advancedBookingDays?: number;

  @IsNumber()
  @IsOptional()
  cancellationHours?: number;

  @IsBoolean()
  @IsOptional()
  confirmationRequired?: boolean;
}

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  @IsNotEmpty()
  taxId: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  cover?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @ValidateNested()
  @Type(() => BusinessConfigDto)
  @IsOptional()
  configs?: BusinessConfigDto;

  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @IsOptional()
  businessHours?: BusinessHoursDto;

  @ValidateNested()
  @Type(() => BookingSettingsDto)
  @IsOptional()
  bookingSettings?: BookingSettingsDto;
}
