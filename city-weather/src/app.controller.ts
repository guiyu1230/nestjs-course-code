import { BadRequestException, Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import pinyin from 'pinyin';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Inject(HttpService)
  private httpService: HttpService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Get('pinyin')
  pinyin(@Query('text') text: string) {
    return pinyin(text, {
      style: 'normal'
    }).join('');
  }

  @Get('weather/:city')
  async weather(@Param('city') city: string) {
    const cityPinyin = pinyin(city, { style: 'normal' }).join('');

    const { data } = await firstValueFrom(
      this.httpService.get(`https://${this.configService.get('weather_host')}/geo/v2/city/lookup?location=${cityPinyin}&key=${this.configService.get('weather_api_key')}`)
    );

    const location = data?.location?.[0];

    if(!location) {
      throw new BadRequestException('没有对应的城市信息');
    }

    const { data: weatherData } = await firstValueFrom(
      this.httpService.get(`https://${this.configService.get('weather_host')}/v7/weather/3d?location=${location.id}&key=${this.configService.get('weather_api_key')}`)
    )

    return weatherData;
  }
}
