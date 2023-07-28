import { Injectable, OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown } from '@nestjs/common';
import { CreateSecondDto } from './dto/create-second.dto';
import { UpdateSecondDto } from './dto/update-second.dto';

@Injectable()
export class SecondService implements OnModuleInit, OnApplicationBootstrap, BeforeApplicationShutdown, BeforeApplicationShutdown, OnApplicationShutdown {

  onModuleInit() {
    console.log('SecondService OnmoduleInit');
  }

  onApplicationBootstrap() {
    console.log('SecondService OnApplicationBootstrap');
  }

  onModuleDestroy() {
    console.log('SecondService onModuleDestroy');
  }

  beforeApplicationShutdown(signal?: string) {
    console.log('SecondService beforeApplicationShutdown', signal);
  }

  onApplicationShutdown() {
    console.log('SecondService onApplicationShutdown');
  }

  create(createSecondDto: CreateSecondDto) {
    return 'This action adds a new second';
  }

  findAll() {
    return `This action returns all second`;
  }

  findOne(id: number) {
    return `This action returns a #${id} second`;
  }

  update(id: number, updateSecondDto: UpdateSecondDto) {
    return `This action updates a #${id} second`;
  }

  remove(id: number) {
    return `This action removes a #${id} second`;
  }
}
