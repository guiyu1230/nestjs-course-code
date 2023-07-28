import { Controller, Get, Post, Body, Patch, Param, Delete, OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown } from '@nestjs/common';
import { SecondService } from './second.service';
import { CreateSecondDto } from './dto/create-second.dto';
import { UpdateSecondDto } from './dto/update-second.dto';

@Controller('second')
export class SecondController implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown {
  constructor(private readonly secondService: SecondService) {}

  onModuleInit() {
    console.log('SecondController onModuleInit');
  }

  onApplicationBootstrap() {
    console.log('SecondController onApplicationBootstrap');
  }

  onModuleDestroy() {
    console.log('SecondController onModuleDestroy');
  }

  beforeApplicationShutdown(signal?: string) {
    console.log('SecondController beforeApplicationShutdown', signal);
  }

  onApplicationShutdown() {
    console.log('SecondController onApplicationShutdown');
  }

  @Post()
  create(@Body() createSecondDto: CreateSecondDto) {
    return this.secondService.create(createSecondDto);
  }

  @Get()
  findAll() {
    return this.secondService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.secondService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSecondDto: UpdateSecondDto) {
    return this.secondService.update(+id, updateSecondDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.secondService.remove(+id);
  }
}
