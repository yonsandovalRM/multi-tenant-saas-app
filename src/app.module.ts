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
import { mongooseModuleAsyncOptions } from './tenants/config/mongoose.config';
import { CompaniesModule } from './tenants/companies/companies.module';
import { TenantModule } from './tenants/tenant.module';
import { ClsModule } from 'nestjs-cls';
import { TenantMiddleware } from './tenants/middlewares/tenant.middleware';

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
