import { Connection } from 'mongoose';
import { PROVIDER } from '../constants/providers';
import {
  Company,
  CompanySchema,
} from '../../companies/entities/company.entity';
import { Tenant, TenantSchema } from '../tenant.schema';

export const TenantModels = {
  productModel: {
    provide: PROVIDER.COMPANY_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Company.name, CompanySchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  tenantModel: {
    provide: PROVIDER.TENANT_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Tenant.name, TenantSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },
};
