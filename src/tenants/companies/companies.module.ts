import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TenantMiddleware } from '../middlewares/tenant.middleware';
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
export class CompaniesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(CompaniesController);
  }
}
