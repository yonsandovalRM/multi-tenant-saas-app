import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyScheduleDto } from './create-company-schedule.dto';

export class UpdateCompanyScheduleDto extends PartialType(CreateCompanyScheduleDto) {}
