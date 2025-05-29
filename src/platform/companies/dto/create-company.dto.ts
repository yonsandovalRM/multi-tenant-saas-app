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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO para BusinessDay
export class BusinessDayDto {
  @ApiPropertyOptional({
    description: 'Indica si el negocio está abierto este día',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isOpen?: boolean;

  @ApiPropertyOptional({
    description: 'Hora de apertura en formato HH:mm',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @IsOptional()
  start?: string;

  @ApiPropertyOptional({
    description: 'Hora de cierre en formato HH:mm',
    example: '18:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @IsOptional()
  end?: string;
}

// DTO para BusinessHours
export class BusinessHoursDto {
  @ApiPropertyOptional({
    description: 'Configuración de horario para el lunes',
    type: BusinessDayDto,
  })
  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  monday?: BusinessDayDto;

  @ApiPropertyOptional({
    description: 'Configuración de horario para el martes',
    type: BusinessDayDto,
  })
  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  tuesday?: BusinessDayDto;

  @ApiPropertyOptional({
    description: 'Configuración de horario para el miércoles',
    type: BusinessDayDto,
  })
  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  wednesday?: BusinessDayDto;

  @ApiPropertyOptional({
    description: 'Configuración de horario para el jueves',
    type: BusinessDayDto,
  })
  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  thursday?: BusinessDayDto;

  @ApiPropertyOptional({
    description: 'Configuración de horario para el viernes',
    type: BusinessDayDto,
  })
  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  friday?: BusinessDayDto;

  @ApiPropertyOptional({
    description: 'Configuración de horario para el sábado',
    type: BusinessDayDto,
  })
  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  saturday?: BusinessDayDto;

  @ApiPropertyOptional({
    description: 'Configuración de horario para el domingo',
    type: BusinessDayDto,
  })
  @ValidateNested()
  @Type(() => BusinessDayDto)
  @IsOptional()
  sunday?: BusinessDayDto;
}

// DTO para BusinessConfig
export class BusinessConfigDto {
  @ApiPropertyOptional({
    description: 'Código de moneda ISO 4217',
    example: 'CLP',
    default: 'CLP',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Zona horaria en formato IANA',
    example: 'America/Santiago',
    default: 'America/Santiago',
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Código de idioma ISO 639-1',
    example: 'es',
    default: 'es',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    description: 'Número de decimales para mostrar precios',
    example: 0,
    minimum: 0,
    maximum: 4,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  decimals?: number;
}

// DTO para BookingSettings
export class BookingSettingsDto {
  @ApiPropertyOptional({
    description: 'Días de anticipación máxima para hacer reservas',
    example: 30,
    minimum: 1,
    maximum: 365,
    default: 30,
  })
  @IsNumber()
  @IsOptional()
  advancedBookingDays?: number;

  @ApiPropertyOptional({
    description: 'Horas mínimas de anticipación para cancelar una reserva',
    example: 24,
    minimum: 0,
    maximum: 168,
    default: 24,
  })
  @IsNumber()
  @IsOptional()
  cancellationHours?: number;

  @ApiPropertyOptional({
    description: 'Indica si las reservas requieren confirmación manual',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  confirmationRequired?: boolean;
}

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Nombre comercial o razón social de la empresa',
    example: 'Mi Empresa S.A.',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({
    description: 'RUT o identificador tributario de la empresa',
    example: '12345678-9',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  taxId: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico de contacto de la empresa',
    example: 'contacto@miempresa.com',
    format: 'email',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono de contacto',
    example: '+56912345678',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Dirección física de la empresa',
    example: 'Av. Principal 123, Santiago, Chile',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'URL del logo de la empresa',
    example: 'https://example.com/logo.png',
    format: 'uri',
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen de portada de la empresa',
    example: 'https://example.com/cover.jpg',
    format: 'uri',
  })
  @IsString()
  @IsOptional()
  cover?: string;

  @ApiPropertyOptional({
    description: 'Sitio web de la empresa',
    example: 'https://miempresa.com',
    format: 'uri',
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({
    description: 'Configuraciones generales del negocio',
    type: BusinessConfigDto,
  })
  @ValidateNested()
  @Type(() => BusinessConfigDto)
  @IsOptional()
  configs?: BusinessConfigDto;

  @ApiPropertyOptional({
    description: 'Horarios de funcionamiento del negocio por día de la semana',
    type: BusinessHoursDto,
  })
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  @IsOptional()
  businessHours?: BusinessHoursDto;

  @ApiPropertyOptional({
    description: 'Configuraciones relacionadas con el sistema de reservas',
    type: BookingSettingsDto,
  })
  @ValidateNested()
  @Type(() => BookingSettingsDto)
  @IsOptional()
  bookingSettings?: BookingSettingsDto;
}
