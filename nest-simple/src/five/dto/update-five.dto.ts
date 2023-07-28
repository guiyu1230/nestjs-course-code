import { PartialType } from '@nestjs/mapped-types';
import { CreateFiveDto } from './create-five.dto';

export class UpdateFiveDto extends PartialType(CreateFiveDto) {}
