import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TenantMiddleware } from '../tenants/middleware/tenant.middleware';
import { TenantModels } from '../providers/tenant-models.provider';

@Module({
  imports: [],
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    TenantModels.productModel,
    TenantModels.tenantModel,
  ],
})
export class CompaniesModule {}
