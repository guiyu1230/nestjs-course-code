import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { userBookignCount } from './vo/UserBookignCount.vo';
import { MeetingRoomUsedCount } from './vo/MeetingRoomUsedCount.vo';

@ApiTags('统计管理模块')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @ApiBearerAuth()
  @ApiQuery({
    name: 'startTime',
    type: String,
    description: '开始时间'
  })
  @ApiQuery({
    name: 'endTime',
    type: String,
    description: '结束时间'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: userBookignCount
  })
  @Get('userBookingCount')
  async userBookignCount(@Query('startTime') startTime: string, @Query('endTime') endTime: string) {
    return this.statisticService.userBookingCount(startTime, endTime);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'startTime',
    type: String,
    description: '开始时间'
  })
  @ApiQuery({
    name: 'endTime',
    type: String,
    description: "结束时间"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MeetingRoomUsedCount
  })
  @Get('meetingRoomUsedCount')
  async meetingRoomUsedCount(@Query('startTime') startTime: string, @Query('endTime') endTime: string) {
    return this.statisticService.meetingRoomUsedCount(startTime, endTime);
  }
}
