## 使用拦截器记录请求日志

```sh
# 创建项目
nest new request-log
# 创建请求日志拦截器
nest g interceptor request-log --no-spec --flat
# 使用request-ip取 X-Forwarded-For获取真实客户端ip
npm install --save request-ip
# 调用http module接口获取ip所在城市
npm install --save @nestjs/axios axios
# 接口返回的字符集是 gbk，而我们用的是 utf-8，所以需要转换一下。
npm install --save iconv-lite
```

```ts
// src/request-log.interceptor.ts
import { CallHandler, ExecutionContext, Inject, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import * as requestIp from 'request-ip';
import { HttpService } from '@nestjs/axios';
import * as iconv from 'iconv-lite';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLogInterceptor.name);

  @Inject(HttpService)
  private httpService: HttpService;

  // 调用接口获取ip所在城市
  async ipToCity(ip: string) {
    const response = await this.httpService.axiosRef(`https://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`, {
      // responseType 为 arraybuffer，也就是二进制的数组，然后用 gbk 的字符集来解码。
      responseType: 'arraybuffer',
      transformResponse: [
        function(data) {
          // responseType 为 arraybuffer，也就是二进制的数组，然后用 gbk 的字符集来解码。
          const str = iconv.decode(data, 'gbk');
          return JSON.parse(str);
        }
      ]
    })
    return response.data.addr;
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    console.log(await this.ipToCity('221.237.121.165'))

    const userAgent = request.headers['user-agent'];

    const { ip, method, path } = request;
    // 使用request-ip取 X-Forwarded-For获取真实客户端ip
    const clientIp = requestIp.getClientIp(ip) || ip;

    this.logger.debug(
      `${method} ${path} ${clientIp} ${userAgent}: ${
        context.getClass().name
      } ${
        context.getHandler().name
      } invoked...`,
    );

    const now = Date.now();


    return next.handle().pipe(
      tap((res) => {
        this.logger.debug(
          `${method} ${path} ${clientIp} ${userAgent}: ${response.statusCode}: ${Date.now() - now}ms`,
        );
        this.logger.debug(`Response: ${JSON.stringify(res)}`);
      })
    );
  }
}
```
- 让日志拦截器全局生效
```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLogInterceptor } from './request-log.interceptor';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLogInterceptor
    }
  ],
})
export class AppModule {}
```


我们通过 interceptor 实现了记录请求日志的功能。

其中 ip 地址如果被 nginx 转发过，需要取 X-Forwarded-For 的 header 的值，我们直接用 request-ip 这个包来做。

如果想拿到 ip 对应的城市信息，可以用一些免费接口来查询，用 @nestjs/axios 来发送请求。当然，这个不建议放到请求日志里。

这样，就可以记录下每次请求响应的信息了。