import { ConflictException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { merge } from 'lodash';
import { InjectTenantModel } from '../multitenant/decorators/tenant-model.decorator';
import { BaseTenantService } from '../multitenant/services/base-tenant.service';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService extends BaseTenantService<Company> {
  constructor(
    @InjectTenantModel('Company')
    private readonly companyModel: Model<Company>,
  ) {
    super(companyModel);
  }

  async createCompany(createCompanyDto: CreateCompanyDto): Promise<Company> {
    // Lógica específica de negocio si es necesaria
    const existingCompany = await this.findOne({
      $or: [
        { businessName: createCompanyDto.businessName },
        { taxId: createCompanyDto.taxId },
      ],
    });

    if (existingCompany) {
      throw new ConflictException(
        'Company with this name or taxId already exists',
      );
    }

    return this.create(createCompanyDto);
  }

  async getActiveCompanies(): Promise<Company[]> {
    return this.findAll({ deleteAt: { $exists: false } });
  }

  // Override del método update con lodash merge
  async updateCompany(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company | null> {
    // Obtener el documento actual
    const currentCompany = await this.companyModel.findById(id);
    if (!currentCompany) {
      throw new Error('Company not found');
    }

    // Crear una copia del documento actual y hacer merge con los nuevos datos
    const mergedData = merge({}, currentCompany.toObject(), updateCompanyDto);

    // Actualizar el documento
    const updatedCompany = await this.companyModel.findByIdAndUpdate(
      id,
      mergedData,
      { new: true, runValidators: true },
    );

    return updatedCompany;
  }
}
