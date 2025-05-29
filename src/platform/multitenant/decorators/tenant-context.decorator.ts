import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

export const TenantContext = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const cls: ClsService = request.cls;

    if (data) {
      return cls?.get(data);
    }

    return {
      tenantId: cls.get('tenantId'),
      tenant: cls.get('tenant'),
    };
  },
);
