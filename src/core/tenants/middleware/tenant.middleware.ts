import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { TenantService } from '../tenant.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
    private readonly cls: ClsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Solo aplicar a rutas que no sean core/auth
    if (req.path.startsWith('/api/v1/core/')) {
      return next();
    }

    // Check for X-TENANT-ID header
    const tenantId = req.headers['x-tenant-id']?.toString();
    if (!tenantId) {
      throw new BadRequestException(
        'X-TENANT-ID header is required for tenant routes',
      );
    }

    // Validate that tenantId belongs to a valid tenant
    const tenant = await this.tenantService.getTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Set tenant context (will be validated again in guard)
    this.cls.set('tenantId', tenantId);
    this.cls.set('tenant', tenant);

    next();
  }
}
