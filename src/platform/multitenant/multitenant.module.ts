import { DynamicModule, Module } from '@nestjs/common';
import {
  MultitenantCoreModule,
  MultitenantModuleOptions,
} from './multitenant-core.module';
import { TenantModule } from '../../core/tenants/tenant.module';

@Module({})
export class MultitenantModule {
  static forRoot(options: MultitenantModuleOptions): DynamicModule {
    return {
      module: MultitenantModule,
      imports: [TenantModule, MultitenantCoreModule.forRoot(options)],
      exports: [MultitenantCoreModule],
    };
  }
}
