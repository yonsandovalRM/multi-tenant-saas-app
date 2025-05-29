import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';
import { RoleProtected } from './role-protected.decorator';
import { JwtTenantGuard } from '../guards/jwt-tenant.guard';
import { UserRoleGuard } from '../guards/user-role.guard';

export function EnhancedAuth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(JwtTenantGuard, UserRoleGuard),
  );
}

// Solo para rutas core
export function CoreAuth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(JwtTenantGuard, UserRoleGuard),
  );
}

// Solo para rutas tenant
export function TenantAuth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(JwtTenantGuard, UserRoleGuard),
  );
}
