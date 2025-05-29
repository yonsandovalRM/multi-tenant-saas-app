import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { TenantAuth } from '../../core/auth/decorators/enhanced-auth.decorator';
import { GetAuthContext } from '../../core/auth/decorators/get-auth-context.decorator';
import { AuthContext } from '../../core/auth/interfaces/auth-context.interface';
import { ValidRoles } from '../../core/auth/interfaces/valid-roles';

@Controller('companies')
@TenantAuth() // Requiere autenticación de tenant
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @TenantAuth(ValidRoles.admin, ValidRoles.user)
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.companiesService.createCompany(createCompanyDto);
  }

  @Get()
  findAll(@GetAuthContext() authContext: AuthContext) {
    return this.companiesService.findAll();
  }

  @Patch(':id')
  @TenantAuth(ValidRoles.admin)
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @GetAuthContext() authContext: AuthContext,
  ) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @TenantAuth(ValidRoles.admin)
  remove(@Param('id') id: string, @GetAuthContext() authContext: AuthContext) {
    return this.companiesService.remove(id);
  }
}
