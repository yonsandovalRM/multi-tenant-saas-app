import { PartialType } from '@nestjs/mapped-types';
import { CreateProfessionalServiceDto } from './create-professional-service.dto';

export class UpdateProfessionalServiceDto extends PartialType(
  CreateProfessionalServiceDto,
) {}
