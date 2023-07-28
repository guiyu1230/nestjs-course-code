import { PartialType } from '@nestjs/mapped-types';
import { CreateSecondDto } from './create-second.dto';

export class UpdateSecondDto extends PartialType(CreateSecondDto) {}
