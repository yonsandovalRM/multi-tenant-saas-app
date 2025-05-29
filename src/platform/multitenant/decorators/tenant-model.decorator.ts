import { Inject } from '@nestjs/common';

export const TENANT_MODEL_PREFIX = 'TENANT_MODEL_';

export function InjectTenantModel(modelName: string) {
  return Inject(`${TENANT_MODEL_PREFIX}${modelName.toUpperCase()}`);
}
