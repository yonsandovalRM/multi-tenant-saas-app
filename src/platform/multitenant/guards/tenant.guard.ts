import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TenantService } from '../../../core/tenants/tenant.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly tenantService: TenantService,
    private readonly cls: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id']?.toString();

    if (!tenantId) {
      throw new BadRequestException('X-TENANT-ID header is required');
    }

    const tenant = await this.tenantService.getTenantById(tenantId);
    if (!tenant) {
      throw new BadRequestException('Invalid tenant ID');
    }

    this.cls.set('tenantId', tenantId);
    this.cls.set('tenant', tenant);

    return true;
  }
}
