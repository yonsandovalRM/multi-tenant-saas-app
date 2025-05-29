import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UnavailableBlocksService } from './unavailable-blocks.service';
import { CreateUnavailableBlockDto } from './dto/create-unavailable-block.dto';
import { UpdateUnavailableBlockDto } from './dto/update-unavailable-block.dto';

@Controller('unavailable-blocks')
export class UnavailableBlocksController {
  constructor(private readonly unavailableBlocksService: UnavailableBlocksService) {}

  @Post()
  create(@Body() createUnavailableBlockDto: CreateUnavailableBlockDto) {
    return this.unavailableBlocksService.create(createUnavailableBlockDto);
  }

  @Get()
  findAll() {
    return this.unavailableBlocksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unavailableBlocksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUnavailableBlockDto: UpdateUnavailableBlockDto) {
    return this.unavailableBlocksService.update(+id, updateUnavailableBlockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unavailableBlocksService.remove(+id);
  }
}
