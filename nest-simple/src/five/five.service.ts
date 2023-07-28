import { Injectable } from '@nestjs/common';
import { CreateFiveDto } from './dto/create-five.dto';
import { UpdateFiveDto } from './dto/update-five.dto';

@Injectable()
export class FiveService {
  create(createFiveDto: CreateFiveDto) {
    return createFiveDto;
    return 'This action adds a new five';
  }

  findAll() {
    return `This action returns all five`;
  }

  findOne(id: number) {
    return `This action returns a #${id} five`;
  }

  update(id: number, updateFiveDto: UpdateFiveDto) {
    return `This action updates a #${id} five`;
  }

  remove(id: number) {
    return `This action removes a #${id} five`;
  }
}
