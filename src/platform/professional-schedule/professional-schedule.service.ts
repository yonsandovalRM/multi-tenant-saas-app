import { Injectable } from '@nestjs/common';
import { CreateProfessionalScheduleDto } from './dto/create-professional-schedule.dto';
import { UpdateProfessionalScheduleDto } from './dto/update-professional-schedule.dto';

@Injectable()
export class ProfessionalScheduleService {
  create(createProfessionalScheduleDto: CreateProfessionalScheduleDto) {
    return 'This action adds a new professionalSchedule';
  }

  findAll() {
    return `This action returns all professionalSchedule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} professionalSchedule`;
  }

  update(id: number, updateProfessionalScheduleDto: UpdateProfessionalScheduleDto) {
    return `This action updates a #${id} professionalSchedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} professionalSchedule`;
  }
}
