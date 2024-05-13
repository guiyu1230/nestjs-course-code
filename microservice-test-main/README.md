之前我们一直写的都是单体的 http 服务，这样项目大了以后会难以维护和扩展。

这时候可以通过微服务的方式把业务逻辑拆分到不同的微服务里。

微服务之间通过 tcp 方式通信，在 nest 里需要用到 @nestjs/microservices 这个包。

微服务启动的时候不再调用 NestFactory.create 而是调用 NestFactory.createMicroservice 方法，指定 tcp 的端口。

然后另一个服务里通过 ClientsModule 来注入连接这个微服务的代理对象。

之后分别用** send、emit 方法来调用微服务的 @MessagePattern、@EventPattern  **声明的方法。

这就是微服务的创建和通信方式。

我们还通过 wireshark 抓包分析了 tcp 通信的内容，发现微服务之间的通信是基于 json 的。

项目大了之后，为了维护和扩展方便，拆分微服务是很自然的事情。

### TCP传输的结论
- 微服务之间的 tcp 通信的消息格式是 json
- 如果是 message 的方式，需要两边各发送一个 tcp 包，也就是一问一答的方式
- 如果是 event 的方式，只需要客户端发送一个 tcp 的包

| 主服务调用API |  微服务调用API | 发送TCP包数量        |   备注     |
| ------- | -------------- | -------------- | ------------------- |
| send    |   @MessagePattern |   2         | 需要两边各发送一个 tcp 包，也就是一问一答的方式   |
| emit    |   @EventPattern   |   1         | 只需要客户端发送一个 tcp 的包   |

#### microservice-test-main 主服务
```js
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // 微服务注册配置
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 8888
        }
      }
    ])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


// app.controller.ts
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  // 微服务注入
  @Inject('USER_SERVICE')
  private userClient: ClientProxy;

  @Get('sum')
  calc(@Query('num') str) {
    const numArr = str.split(',').map(item => parseInt(item));
    // emit方法调用. 不需要返回信息. 传输一个TCP包. 
    // 调用微服务的@MessagePattern方法
    this.userClient.emit('log', '求和1111');
    // send方法调用. 需要返回信息. 来回传输两个TCP包
    // 调用微服务的@EventPattern
    return this.userClient.send('sum', numArr);
  }
}
```

#### microservice-test-user 微服务
```js
// main.ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: 8888
      }
    }
  );
  app.listen();
}
bootstrap();

// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('sum')
  sum(numArr: Array<number>): number {
    return numArr.reduce((total, item) => total + item, 0);
  }

  @EventPattern('log')
  log(str: string) {
    console.log(str);
  }
}
```