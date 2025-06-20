import { Controller, Get, Sse } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get('list')
  @Sse('list')
  async universityList() {
    return this.appService.getUniversityData();
  }
}
