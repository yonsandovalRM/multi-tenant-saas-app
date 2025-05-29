import { IsEmail, IsString, IsOptional } from 'class-validator';

export class TenantRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  tenantId: string;

  @IsString()
  @IsOptional()
  role?: string;
}
