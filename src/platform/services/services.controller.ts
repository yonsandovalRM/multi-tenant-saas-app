import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateProfessionalServiceDto } from './dto/create-professional-service.dto';
import { UpdateProfessionalServiceDto } from './dto/update-professional-service.dto';
import { TenantAuth } from '../../core/auth/decorators/enhanced-auth.decorator';
import { GetAuthContext } from '../../core/auth/decorators/get-auth-context.decorator';
import { AuthContext } from '../../core/auth/interfaces/auth-context.interface';
import { ValidRoles } from '../../core/auth/interfaces/valid-roles';

@Controller('services')
@TenantAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // ==================== ENDPOINTS DE SERVICIOS ====================

  @Post()
  @TenantAuth(ValidRoles.admin)
  createService(
    @Body() createServiceDto: CreateServiceDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.createService(createServiceDto);
  }

  @Get()
  findAllServices(
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive = false,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.findAllServices(includeInactive);
  }

  @Get('stats')
  @TenantAuth(ValidRoles.admin)
  getServicesWithStats(@GetAuthContext() authContext: AuthContext) {
    return this.servicesService.getServicesWithProfessionalCount();
  }

  @Get('category/:category')
  getServicesByCategory(
    @Param('category') category: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.getServicesByCategory(category);
  }

  @Get('duration')
  getServicesByDuration(
    @GetAuthContext() authContext: AuthContext,
    @Query('min') minDuration?: string,
    @Query('max') maxDuration?: string,
  ) {
    const min = minDuration ? parseInt(minDuration) : undefined;
    const max = maxDuration ? parseInt(maxDuration) : undefined;
    return this.servicesService.getActiveServicesByDuration(min, max);
  }

  @Get(':id')
  findServiceById(
    @Param('id') id: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.findServiceById(id);
  }

  @Get(':id/stats')
  @TenantAuth(ValidRoles.admin)
  getServiceStats(
    @Param('id') id: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.getServiceStats(id);
  }

  @Get(':id/professionals')
  getServiceProfessionals(
    @Param('id') serviceId: string,
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive = false,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.getServiceProfessionals(
      serviceId,
      includeInactive,
    );
  }

  @Get(':id/available-professionals')
  getAvailableProfessionalsForService(
    @Param('id') serviceId: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.getAvailableProfessionalsForService(serviceId);
  }

  @Patch(':id')
  @TenantAuth(ValidRoles.admin)
  updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.updateService(id, updateServiceDto);
  }

  @Delete(':id')
  @TenantAuth(ValidRoles.admin)
  removeService(
    @Param('id') id: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.deleteService(id);
  }

  // ==================== ENDPOINTS DE SERVICIOS PROFESIONALES ====================

  @Post('professional-assignments')
  @TenantAuth(ValidRoles.admin)
  assignServiceToProfessional(
    @Body() createProfessionalServiceDto: CreateProfessionalServiceDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.assignServiceToProfessional(
      createProfessionalServiceDto,
    );
  }

  @Get('professional/:professionalId')
  getProfessionalServices(
    @Param('professionalId') professionalId: string,
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive = false,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.getProfessionalServices(
      professionalId,
      includeInactive,
    );
  }

  @Get('professional/:professionalId/service/:serviceId')
  getProfessionalServiceDetails(
    @Param('professionalId') professionalId: string,
    @Param('serviceId') serviceId: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.getProfessionalServiceDetails(
      professionalId,
      serviceId,
    );
  }

  @Patch('professional-assignments/:id')
  @TenantAuth(ValidRoles.admin)
  updateProfessionalService(
    @Param('id') id: string,
    @Body() updateProfessionalServiceDto: UpdateProfessionalServiceDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.updateProfessionalService(
      id,
      updateProfessionalServiceDto,
    );
  }

  @Delete('professional-assignments/:id')
  @TenantAuth(ValidRoles.admin)
  removeProfessionalService(
    @Param('id') id: string,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.servicesService.removeProfessionalService(id);
  }
}
