import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TenantModels } from '../providers/tenant-models.provider';

@Module({
  imports: [],
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    TenantModels.companyModel,
    TenantModels.tenantModel,
  ],
})
export class CompaniesModule {}
