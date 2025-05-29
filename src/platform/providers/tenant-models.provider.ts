import { Connection } from 'mongoose';
import { PROVIDER } from '../constants/providers';
import { Company, CompanySchema } from '../companies/entities/company.entity';
import { Tenant, TenantSchema } from '../tenants/tenant.schema';
import { Scope } from '@nestjs/common';
import {
  CompanySchedule,
  CompanyScheduleSchema,
} from '../company-schedule/entities/company-schedule.entity';

export const TenantModels = {
  companyModel: {
    provide: PROVIDER.COMPANY_MODEL,
    scope: Scope.REQUEST,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Company.name, CompanySchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },
  companyScheduleModel: {
    provide: PROVIDER.COMPANY_SCHEDULE_MODEL,
    scope: Scope.REQUEST,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(
        CompanySchedule.name,
        CompanyScheduleSchema,
      );
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  tenantModel: {
    provide: PROVIDER.TENANT_MODEL,
    scope: Scope.REQUEST,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Tenant.name, TenantSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },
};
