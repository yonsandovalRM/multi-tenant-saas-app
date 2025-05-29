import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { TenantAuth } from '../../core/auth/decorators/enhanced-auth.decorator';
import { GetAuthContext } from '../../core/auth/decorators/get-auth-context.decorator';
import { AuthContext } from '../../core/auth/interfaces/auth-context.interface';
import { ValidRoles } from '../../core/auth/interfaces/valid-roles';

@ApiTags('Companies')
@Controller('companies')
@TenantAuth() // Requiere autenticación de tenant
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @TenantAuth(ValidRoles.admin, ValidRoles.user)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva compañía',
    description:
      'Crea una nueva compañía en el sistema. Requiere rol de admin o user.',
  })
  @ApiBody({
    type: CreateCompanyDto,
    description: 'Datos de la compañía a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Compañía creada exitosamente',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        businessName: 'Mi Empresa S.A.',
        taxId: '12345678-9',
        email: 'contacto@miempresa.com',
        phone: '+56912345678',
        address: 'Av. Principal 123, Santiago',
        logo: 'https://example.com/logo.png',
        cover: 'https://example.com/cover.jpg',
        website: 'https://miempresa.com',
        configs: {
          currency: 'CLP',
          timezone: 'America/Santiago',
          language: 'es',
          decimals: 0,
        },
        businessHours: {
          monday: { isOpen: true, start: '09:00', end: '18:00' },
          tuesday: { isOpen: true, start: '09:00', end: '18:00' },
          // ... otros días
        },
        bookingSettings: {
          advancedBookingDays: 30,
          cancellationHours: 24,
          confirmationRequired: true,
        },
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiConflictResponse({
    description:
      'Conflicto - Ya existe una compañía con ese nombre comercial o RUT',
    schema: {
      example: {
        statusCode: 409,
        message: 'Company with this name or taxId already exists',
        error: 'Conflict',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiForbiddenResponse({
    description: 'Prohibido - No tienes permisos suficientes',
  })
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.companiesService.createCompany(createCompanyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las compañías',
    description: 'Recupera la lista de todas las compañías del tenant actual.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de compañías obtenida exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        example: {
          _id: '507f1f77bcf86cd799439011',
          businessName: 'Mi Empresa S.A.',
          taxId: '12345678-9',
          email: 'contacto@miempresa.com',
          phone: '+56912345678',
          address: 'Av. Principal 123, Santiago',
          logo: 'https://example.com/logo.png',
          cover: 'https://example.com/cover.jpg',
          website: 'https://miempresa.com',
          configs: {
            currency: 'CLP',
            timezone: 'America/Santiago',
            language: 'es',
            decimals: 0,
          },
          businessHours: {
            monday: { isOpen: true, start: '09:00', end: '18:00' },
            tuesday: { isOpen: true, start: '09:00', end: '18:00' },
          },
          bookingSettings: {
            advancedBookingDays: 30,
            cancellationHours: 24,
            confirmationRequired: true,
          },
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o expirado',
  })
  findAll(@GetAuthContext() authContext: AuthContext) {
    return this.companiesService.findAll();
  }

  @Patch(':id')
  @TenantAuth(ValidRoles.admin)
  @ApiOperation({
    summary: 'Actualizar una compañía',
    description:
      'Actualiza los datos de una compañía existente. Solo disponible para administradores.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la compañía',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateCompanyDto,
    description: 'Datos a actualizar de la compañía (campos opcionales)',
  })
  @ApiResponse({
    status: 200,
    description: 'Compañía actualizada exitosamente',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        businessName: 'Mi Empresa Actualizada S.A.',
        taxId: '12345678-9',
        email: 'nuevo-contacto@miempresa.com',
        phone: '+56912345678',
        address: 'Nueva Dirección 456, Santiago',
        logo: 'https://example.com/new-logo.png',
        cover: 'https://example.com/new-cover.jpg',
        website: 'https://miempresa.com',
        configs: {
          currency: 'CLP',
          timezone: 'America/Santiago',
          language: 'es',
          decimals: 0,
        },
        businessHours: {
          monday: { isOpen: true, start: '08:00', end: '19:00' },
          tuesday: { isOpen: true, start: '08:00', end: '19:00' },
        },
        bookingSettings: {
          advancedBookingDays: 45,
          cancellationHours: 48,
          confirmationRequired: false,
        },
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-16T14:20:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'No encontrado - La compañía no existe',
    schema: {
      example: {
        statusCode: 404,
        message: 'Company not found',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiForbiddenResponse({
    description: 'Prohibido - Se requiere rol de administrador',
  })
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.companiesService.updateCompany(id, updateCompanyDto);
  }

  @Delete(':id')
  @TenantAuth(ValidRoles.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una compañía',
    description:
      'Elimina una compañía del sistema. Solo disponible para administradores.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la compañía a eliminar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Compañía eliminada exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'No encontrado - La compañía no existe',
    schema: {
      example: {
        statusCode: 404,
        message: 'Company not found',
        error: 'Not Found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiForbiddenResponse({
    description: 'Prohibido - Se requiere rol de administrador',
  })
  remove(@Param('id') id: string, @GetAuthContext() authContext: AuthContext) {
    return this.companiesService.remove(id);
  }
}
