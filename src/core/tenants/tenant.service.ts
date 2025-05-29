import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tenant } from './tenant.schema';
import { Model } from 'mongoose';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<Tenant>) {}

  async getTenantById(tenantId: string): Promise<Tenant | null> {
    return await this.tenantModel.findOne({ tenantId }).exec();
  }

  async getAllTenants(): Promise<Tenant[]> {
    return await this.tenantModel.find().exec();
  }
  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const newTenant = new this.tenantModel(createTenantDto);
    newTenant.tenantId = await this.createTenantId(newTenant.name);
    return await newTenant.save();
  }

  private async createTenantId(name: string): Promise<string> {
    const tenantId = name.toLowerCase().replace(/\s+/g, '-');
    const existingTenant = await this.tenantModel.findOne({ tenantId }).exec();
    if (existingTenant) {
      throw new BadRequestException(
        `Tenant with ID ${tenantId} already exists`,
      );
    }
    return tenantId;
  }
}
