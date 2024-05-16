import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query } from '@nestjs/common';
import { AaaService } from './aaa.service';
import { EtcdService } from 'src/etcd/etcd.service';


@Controller('aaa')
export class AaaController {
  constructor(private readonly aaaService: AaaService) {}

  @Inject(EtcdService)
  private etcdService: EtcdService;

  @Get('save')
  async saveConfig(@Query('value') value: string) {
    await this.etcdService.saveConfig('aaa', value);
    return 'done';
  }

  @Get('get')
  async getConfig() {
    return await this.etcdService.getConfig('aaa');
  }
}
