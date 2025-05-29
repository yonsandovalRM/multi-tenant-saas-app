import { Module } from '@nestjs/common';
import { CompanyScheduleService } from './company-schedule.service';
import { CompanyScheduleController } from './company-schedule.controller';
import { TenantModels } from '../providers/tenant-models.provider';

@Module({
  controllers: [CompanyScheduleController],
  providers: [
    CompanyScheduleService,
    TenantModels.companyScheduleModel,
    TenantModels.tenantModel,
    TenantModels.companyModel,
  ],
})
export class CompanyScheduleModule {}
