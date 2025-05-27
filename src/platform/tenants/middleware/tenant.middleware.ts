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
    // Check for X-TENANT-ID header
    const tenantId = req.headers['x-tenant-id']?.toString();
    if (!tenantId) {
      throw new BadRequestException('X-TENANT-ID not provided');
    }

    // Validate that tenantId belongs to a valid tenant
    const isTenantExist = await this.tenantService.getTenantById(tenantId);
    if (!isTenantExist) {
      throw new NotFoundException('Tenant not found');
    }

    this.cls.set('tenantId', tenantId);

    next();
  }
}
