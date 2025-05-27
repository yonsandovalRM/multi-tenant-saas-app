import { Body, Controller, Get, Post } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('core/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  async getTenants() {
    return await this.tenantService.getAllTenants();
  }

  @Post()
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return await this.tenantService.createTenant(createTenantDto);
  }
}
