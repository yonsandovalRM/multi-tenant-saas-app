import { Module } from '@nestjs/common';
import { UnavailableBlocksService } from './unavailable-blocks.service';
import { UnavailableBlocksController } from './unavailable-blocks.controller';

@Module({
  controllers: [UnavailableBlocksController],
  providers: [UnavailableBlocksService],
  exports: [UnavailableBlocksService],
})
export class UnavailableBlocksModule {}
