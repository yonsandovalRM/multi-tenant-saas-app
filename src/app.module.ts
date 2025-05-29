import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClsModule } from 'nestjs-cls';

import { MultitenantModule } from './platform/multitenant/multitenant.module';
import { TenantMiddleware } from './core/tenants/middleware/tenant.middleware';

// Importar esquemas
import { CompanySchema } from './platform/companies/entities/company.entity';
import { CompanyScheduleSchema } from './platform/company-schedule/entities/company-schedule.entity';

// Importar módulos
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './platform/companies/companies.module';
import { CompanyScheduleModule } from './platform/company-schedule/company-schedule.module';
import { PlansModule } from './core/plans/plans.module';
import { UsersModule } from './core/users/users.module';
import { AuthModule } from './core/auth/auth.module';

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
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    // Configuración del módulo multitenant con todos los modelos
    MultitenantModule.forRoot({
      models: [
        { name: 'Company', schema: CompanySchema },
        { name: 'CompanySchedule', schema: CompanyScheduleSchema },
        // Agregar más modelos aquí fácilmente
      ],
    }),
    CompaniesModule,
    CompanyScheduleModule,
    PlansModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        // Excluir todas las rutas core
        { path: 'core/(.*)', method: RequestMethod.ALL },
        // Excluir rutas de auth específicamente
        { path: 'core/auth/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
