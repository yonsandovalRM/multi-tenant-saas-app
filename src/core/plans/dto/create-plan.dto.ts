import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PlanName } from '../entities/plan.entity';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(PlanName)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString({ each: true })
  @IsNotEmpty()
  features: string[];

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
