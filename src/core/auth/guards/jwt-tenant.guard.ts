import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { TenantService } from '../../tenants/tenant.service';

@Injectable()
export class JwtTenantGuard extends AuthGuard('jwt') {
  constructor(
    private readonly cls: ClsService,
    private readonly tenantService: TenantService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero validar JWT
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const path = request.path;
    console.log('user', user);
    console.log('path', path);
    // Determinar si es ruta core o tenant
    const isCoreRoute = path.startsWith('/api/v1/core/');
    const tenantIdFromHeader = request.headers['x-tenant-id']?.toString();

    if (isCoreRoute) {
      return this.validateCoreAccess(user, path);
    } else {
      return await this.validateTenantAccess(user, tenantIdFromHeader);
    }
  }

  private validateCoreAccess(user: any, path: string): boolean {
    // Solo usuarios core pueden acceder a rutas core (excepto auth)
    if (path.startsWith('/api/v1/core/auth/')) {
      return true; // Las rutas de auth son públicas
    }

    if (!user.isCoreUser) {
      throw new ForbiddenException('Access denied to core resources');
    }

    return true;
  }

  private async validateTenantAccess(
    user: any,
    tenantIdFromHeader: string,
  ): Promise<boolean> {
    if (!tenantIdFromHeader) {
      throw new UnauthorizedException('X-TENANT-ID header is required');
    }

    // Validar que el tenant existe
    const tenant = await this.tenantService.getTenantById(tenantIdFromHeader);
    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant ID');
    }

    // Si es usuario core con rol admin, puede acceder a cualquier tenant
    if (user.isCoreUser && user.role === 'admin') {
      this.cls.set('tenantId', tenantIdFromHeader);
      this.cls.set('tenant', tenant);
      return true;
    }
    console.log('user', user);
    console.log('tenantIdFromHeader', tenantIdFromHeader);
    // Si es usuario de tenant, debe coincidir con su tenant asignado
    if (!user.isCoreUser) {
      if (user.tenantId !== tenantIdFromHeader) {
        throw new ForbiddenException('Access denied to this tenant');
      }
      this.cls.set('tenantId', tenantIdFromHeader);
      this.cls.set('tenant', tenant);
      return true;
    }

    // Usuarios core sin rol admin no pueden acceder a tenants
    throw new ForbiddenException('Insufficient permissions for tenant access');
  }
}
