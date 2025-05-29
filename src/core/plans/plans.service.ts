import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Model } from 'mongoose';
import { Plan } from './entities/plan.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan.name)
    private readonly planModel: Model<Plan>,
  ) {}

  async create(createPlanDto: CreatePlanDto) {
    const plan = await this.planModel.findOne({ name: createPlanDto.name });
    if (plan) {
      throw new ConflictException('Plan already exists');
    }
    const newPlan = new this.planModel(createPlanDto);
    return newPlan.save();
  }

  async findAll() {
    return await this.planModel.find().exec();
  }

  async findOne(id: string) {
    const plan = await this.planModel.findById(id).exec();
    if (!plan) {
      return null;
    }
    return plan;
  }

  update(id: number, updatePlanDto: UpdatePlanDto) {
    return `This action updates a #${id} plan`;
  }

  remove(id: number) {
    return `This action removes a #${id} plan`;
  }
}
