import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateProfessionalServiceDto {
  @IsString()
  @IsNotEmpty()
  professionalId: string;

  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  customPrice?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  customDuration?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
