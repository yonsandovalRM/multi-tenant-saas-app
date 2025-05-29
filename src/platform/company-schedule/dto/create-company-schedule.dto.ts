import {
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCompanyScheduleDto {
  @IsString()
  @IsMongoId()
  company: string;

  @IsNumber()
  @IsIn([0, 1, 2, 3, 4, 5, 6])
  dayOfWeek: number;

  @IsString()
  start: string;

  @IsString()
  end: string;

  @IsString()
  @IsOptional()
  breakStart?: string;

  @IsString()
  @IsOptional()
  breakEnd?: string;
}
