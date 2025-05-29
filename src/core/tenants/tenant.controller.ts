import { Body, Controller, Get, Post } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('core/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all tenants',
    description: 'Retrieve all registered tenants in the system',
  })
  @ApiOkResponse({
    description: 'List of all tenants',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          domain: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getTenants() {
    return await this.tenantService.getAllTenants();
  }

  @Post()
  @ApiOperation({
    summary: 'Create new tenant',
    description: 'Create a new tenant in the system',
  })
  @ApiBody({ type: CreateTenantDto })
  @ApiCreatedResponse({
    description: 'Tenant created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        domain: { type: 'string' },
        isActive: { type: 'boolean', default: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or domain already exists',
  })
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return await this.tenantService.createTenant(createTenantDto);
  }
}
