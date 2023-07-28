import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { FirstService } from './first.service';
import { CreateFirstDto } from './dto/create-first.dto';
import { UpdateFirstDto } from './dto/update-first.dto';


@Controller('first')
export class FirstController {
  constructor(private readonly firstService: FirstService) {}

  @Post()
  create(@Body() createFirstDto: CreateFirstDto) {
    
    return this.firstService.create(createFirstDto);
  }

  @Get()
  findAll() {
    return this.firstService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.firstService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFirstDto: UpdateFirstDto) {
    return this.firstService.update(+id, updateFirstDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.firstService.remove(+id);
  }
}
