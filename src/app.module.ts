import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseModuleAsyncOptions } from './platform/config/mongoose.config';
import { CompaniesModule } from './platform/companies/companies.module';
import { TenantModule } from './platform/tenants/tenant.module';
import { ClsModule } from 'nestjs-cls';
import { TenantMiddleware } from './platform/tenants/middleware/tenant.middleware';
import { PlansModule } from './core/plans/plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
    CompaniesModule,
    TenantModule,
    PlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude({ path: 'core/(.*)', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}
