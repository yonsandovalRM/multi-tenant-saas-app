import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ClsService } from 'nestjs-cls';
import { PROVIDER } from '../constants/providers';
import { Scope } from '@nestjs/common';

export const TenantConnectionProvider = {
  provide: PROVIDER.TENANT_CONNECTION,
  scope: Scope.REQUEST,
  useFactory: async (cls: ClsService, connection: Connection) => {
    const tenantId = cls.get('tenantId');
    return connection.useDb(`tenant_${tenantId}`);
  },
  inject: [ClsService, getConnectionToken()],
};
