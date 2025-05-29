import { Injectable } from '@nestjs/common';
import { CreateUnavailableBlockDto } from './dto/create-unavailable-block.dto';
import { UpdateUnavailableBlockDto } from './dto/update-unavailable-block.dto';

@Injectable()
export class UnavailableBlocksService {
  create(createUnavailableBlockDto: CreateUnavailableBlockDto) {
    return 'This action adds a new unavailableBlock';
  }

  findAll() {
    return `This action returns all unavailableBlocks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} unavailableBlock`;
  }

  update(id: number, updateUnavailableBlockDto: UpdateUnavailableBlockDto) {
    return `This action updates a #${id} unavailableBlock`;
  }

  remove(id: number) {
    return `This action removes a #${id} unavailableBlock`;
  }
}
