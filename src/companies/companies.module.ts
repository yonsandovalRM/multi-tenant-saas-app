import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TenantsMiddleware } from 'src/tenants/middlewares/tenant.middleware';
import { TenantModels } from 'src/tenants/providers/tenant-models.provider';

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
    consumer.apply(TenantsMiddleware).forRoutes(CompaniesController);

    //Use the wildcard character (*) to apply the middleware to all routes in the module.
  }
}
