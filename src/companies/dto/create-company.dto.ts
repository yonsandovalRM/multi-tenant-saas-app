import { IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
