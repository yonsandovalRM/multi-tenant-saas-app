import { PartialType } from '@nestjs/mapped-types';
import { CreateUnavailableBlockDto } from './create-unavailable-block.dto';

export class UpdateUnavailableBlockDto extends PartialType(CreateUnavailableBlockDto) {}
