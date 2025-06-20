## HttpModule+pinyin实现天气预报查询

### 请求服务来自[和风天气](https://id.qweather.com/#/homepage). 免费的接口一天可以请求 1000 次

### 创建项目
```bash
nest new city-weather
# 中文名换算成拼音来查询
npm install --save pinyin
# httpModule服务
npm install --save @nestjs/axios axios
# 请求第三方服务密钥保存
npm install --save @nestjs/config
```

### axios服务和config服务注册

使用 @nestjs/config 包的 ConfigModule 来封装配置。

要注意的是，如果用了 .env 文件，需要保证它在 src 下，并且要在 nest-cli.json 里配置 assets 和 watchAssets，不然 build 的时候不会复制到 dist 下。 

配置的env路径必须是`envFilePath: [path.join(__dirname, '.env')]` 才可以成功读取src/.env配置

```js
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';


@Module({
  imports: [
    // 注册http请求服务
    HttpModule.register({
      timeout: 5000,
    }),
    // 必须是path.join(__dirname, '.env') 才可以成功读取src/.env配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.join(__dirname, '.env')]
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 使用pinyin将中文换算成拼音然后请求天气预报内容
- 使用pinyin将中文换算成拼音
- 将拼音作为参数和密钥去请求服务获取城市id信息
- 将城市id作为参数和密钥去请求服务获取城市的天气预报信息

查询城市id接口信息

`https://${this.configService.get('weather_host')}/geo/v2/city/lookup?location=${cityPinyin}&key=${this.configService.get('weather_api_key')}`

查询城市天气预报接口

`https://${this.configService.get('weather_host')}/v7/weather/3d?location=${location.id}&key=${this.configService.get('weather_api_key')}`

### 关键api使用
```js
// pinyin的核心用法
const cityPinyin = pinyin(city, { style: 'normal' }).join('');

// HttpModule 把 axios 的方法返回值封装成了 rxjs 的 Observerabl
// 转成 promise 还得加一层 firstValueFrom
const { data } = await firstValueFrom(
  this.httpService.get('api.example.cn')
);
```

### 源代码
```js
import { BadRequestException, Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import pinyin from 'pinyin';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(HttpService)
  private httpService: HttpService;

  @Inject(ConfigService)
  private configService: ConfigService;

  // 根据汉字返回拼音
  @Get('pinyin')
  pinyin(@Query('text') text: string) {
    // pinyin的核心用法
    return pinyin(text, {
      style: 'normal'
    }).join('');
  }

  // 根据城市名返回天气信息
  @Get('weather/:city')
  async weather(@Param('city') city: string) {
    // pinyin的核心用法
    const cityPinyin = pinyin(city, { style: 'normal' }).join('');
    // HttpModule 把 axios 的方法返回值封装成了 rxjs 的 Observerabl
    // 转成 promise 还得加一层 firstValueFrom
    const { data } = await firstValueFrom(
      this.httpService.get(`https://${this.configService.get('weather_host')}/geo/v2/city/lookup?location=${cityPinyin}&key=${this.configService.get('weather_api_key')}`)
    );

    const location = data?.location?.[0];

    if(!location) {
      throw new BadRequestException('没有对应的城市信息');
    }
    // HttpModule 把 axios 的方法返回值封装成了 rxjs 的 Observerabl
    // 转成 promise 还得加一层 firstValueFrom
    const { data: weatherData } = await firstValueFrom(
      this.httpService.get(`https://${this.configService.get('weather_host')}/v7/weather/3d?location=${location.id}&key=${this.configService.get('weather_api_key')}`)
    )

    return weatherData;
  }
}
```