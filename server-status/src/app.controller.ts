import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as os from 'os';
import * as nodeDiskInfo from 'node-disk-info';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('status')
  async status() {
    return {
      cpu: this.getCupInfo(),
      mem: this.getMemInfo(),
      dist: await this.getDistInfo(),
    }
  }

  async getDistInfo() {
    const disks = await nodeDiskInfo.getDiskInfo();
    const sysFiles = disks.map((disk: any) => {
      return {
        dirName: disk.mounted,
        typeName: disk.filesystem,
        total: this.bytesToGB(disk.blocks) + ' GB',
        used: this.bytesToGB(disk.used) + ' GB',
        free: this.bytesToGB(disk.available) + ' GB',
        usage: ((disk.used / disk.blocks) * 100).toFixed(2)
      }
    });
    return sysFiles;
  }

  bytesToGB(bytes) {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2);
  }

  getMemInfo() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsagePercentage = (((totalMem - freeMem) / totalMem) * 100).toFixed(2);
    return {
      total: this.bytesToGB(totalMem),
      used: this.bytesToGB(usedMem),
      free: this.bytesToGB(freeMem),
      usage: memoryUsagePercentage,
    }
  }

  getCupInfo() {
    const cpus = os.cpus();
    const cpuInfo = cpus.reduce(
      (info, cpu) => {
        info.cpuNum += 1;
        info.user += cpu.times.user;
        info.sys += cpu.times.sys;
        info.idle += cpu.times.idle;
        info.total += cpu.times.user + cpu.times.sys + cpu.times.idle;
        return info;
      }, 
      { user: 0, sys: 0, idle: 0, total: 0, cpuNum: 0 }
    );
    const cpu = {
      cpuNum: cpuInfo.cpuNum,
      sys: ((cpuInfo.sys / cpuInfo.total) * 100).toFixed(2),
      used: ((cpuInfo.user / cpuInfo.total) * 100).toFixed(2),
      free: ((cpuInfo.idle / cpuInfo.total) * 100).toFixed(2),
    };
    return cpu;
  }
}
