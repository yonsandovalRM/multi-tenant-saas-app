import { Inject, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PROVIDER } from '../tenants/constants/providers';
import { Model } from 'mongoose';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @Inject(PROVIDER.COMPANY_MODEL)
    private companyModel: Model<Company>,
  ) {}

  create(createCompanyDto: CreateCompanyDto) {
    const company = new this.companyModel(createCompanyDto);
    return company.save();
  }

  async findAll() {
    return await this.companyModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
