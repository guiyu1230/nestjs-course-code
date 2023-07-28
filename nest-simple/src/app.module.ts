import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirstModule } from './first/first.module';
import { SecondModule } from './second/second.module';
import { FourModule } from './four/four.module';
import { ThirdMiddleware } from './third/third.middleware';
import { FiveModule } from './five/five.module';

@Module({
  imports: [FirstModule, SecondModule, FourModule.register({  // 动态模块
    aaa: 1,
    bbb: '123'
  }), FiveModule],
  controllers: [AppController],
  //providers: [AppService],
  providers: [
    AppService, // 1. 最常用的(简洁版)
    {           // 2. 最常用(完整版) provide既可以是对象也可以是字符串
      provide: 'app_service',
      useClass: AppService
    },{         // 3. 自定义值
      provide: 'person',
      useValue: {
        name: 'aaa',
        age: 20
      }
    },{         // 4. 动态返回值
      provide: 'person2',
      useFactory() {
        return {
          name: 'bbbb',
          desc: 'cccc'
        }
      }
    }, {        // 5. 支持参数注入 联动其他token
      provide: 'person3',
      useFactory(person: {name: string}, appService: AppService) {
        return {
          name: person.name,
          desc: appService.getHello()
        }
      },
      inject: ['person', AppService]
    }, {        // 6. provider 还可以通过 useExisting 来指定别名
      provide: 'person4',
      useExisting: 'person2'
    }, {        // 7. 支持异步
      provide: 'person5',
      async useFactory() {
        await new Promise((resolve) => {
          console.log('开始等待');
          setTimeout(resolve, 500);
        })
        console.log('等待3s结束');
        return {
          name: 'bbb',
          desc: 'cccc'
        }
      }
    }
  ]
})
export class AppModule implements NestModule {
  // 中间件注册：实现 NestModule 接口的 configure 方法，在里面应用 AaaMiddleware 到所有路由。
  // interceptor 更适合处理与具体业务相关的逻辑，而 middleware 适合更通用的处理逻辑
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ThirdMiddleware).forRoutes('four');
    consumer.apply(ThirdMiddleware).forRoutes({ path: 'first*', method: RequestMethod.GET });
  }
}
