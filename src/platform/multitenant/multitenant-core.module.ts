import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ClsService } from 'nestjs-cls';
import { Scope } from '@nestjs/common';
import { TenantModelDefinition } from './interfaces/tenant-model-definition.interface';
import { TENANT_MODEL_PREFIX } from './decorators/tenant-model.decorator';

export interface MultitenantModuleOptions {
  models: TenantModelDefinition[];
}

@Global()
@Module({})
export class MultitenantCoreModule {
  static forRoot(options: MultitenantModuleOptions): DynamicModule {
    const tenantConnectionProvider: Provider = {
      provide: 'TENANT_CONNECTION',
      scope: Scope.REQUEST,
      useFactory: async (cls: ClsService, connection: Connection) => {
        const tenantId = cls.get('tenantId');
        if (!tenantId) {
          throw new Error('Tenant ID not found in context');
        }
        return connection.useDb(`tenant_${tenantId}`);
      },
      inject: [ClsService, getConnectionToken()],
    };

    const modelProviders: Provider[] = options.models.map((modelDef) => ({
      provide: `${TENANT_MODEL_PREFIX}${modelDef.name.toUpperCase()}`,
      scope: Scope.REQUEST,
      useFactory: async (tenantConnection: Connection) => {
        return tenantConnection.model(
          modelDef.name,
          modelDef.schema,
          modelDef.collection,
        );
      },
      inject: ['TENANT_CONNECTION'],
    }));

    return {
      module: MultitenantCoreModule,
      providers: [tenantConnectionProvider, ...modelProviders],
      exports: [tenantConnectionProvider, ...modelProviders],
    };
  }
}
