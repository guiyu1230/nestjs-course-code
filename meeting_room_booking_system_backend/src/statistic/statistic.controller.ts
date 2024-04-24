import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('userBookingCount')
  async userBookignCount(@Query('startTime') startTime: string, @Query('endTime') endTime: string) {
    return this.statisticService.userBookingCount(startTime, endTime);
  }

  @Get('meetingRoomUsedCount')
  async meetingRoomUsedCount(@Query('startTime') startTime: string, @Query('endTime') endTime: string) {
    return this.statisticService.meetingRoomUsedCount(startTime, endTime);
  }
}
