import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PROVIDER } from '../constants/providers';
import { Model } from 'mongoose';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @Inject(PROVIDER.COMPANY_MODEL)
    private companyModel: Model<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const companyExists = await this.companyModel
      .findOne({
        $or: [
          { businessName: createCompanyDto.businessName },
          { taxId: createCompanyDto.taxId },
        ],
      })
      .exec();

    if (companyExists) {
      throw new ConflictException('Company already exists');
    }

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
