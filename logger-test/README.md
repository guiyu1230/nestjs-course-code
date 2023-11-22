日志打印可以用 Nest 的 Logger，它支持在创建应用的时候指定 logger 是否开启，打印的日志级别，还可以自定义 logger。

自定义 Logger 需要实现 LoggerService 接口，或者继承 ConsoleLogger 然后重写部分方法。

如果想在 Logger 注入一些 provider，就需要创建应用时设置 bufferLogs 为 true，然后用 app.useLogger(app.get(xxxLogger)) 来指定 Logger。

你可以把这个自定义 Logger 封装到全局模块，或者动态模块里。

当然，一般情况下，直接使用 Logger 就可以了。

### logger/logger.module.ts为全局注册模块
```js
import { Module, Global } from '@nestjs/common';
import { MyLogger } from 'src/MyLogger';

@Global()
@Module({
  providers: [MyLogger],
  exports: [MyLogger]
})
export class LoggerModule {}

```

### logger2/logger2.module.ts为动态注册模块
```js
import { DynamicModule, Module } from '@nestjs/common';
import { MyLogger } from './MyLogger';

@Module({})
export class Logger2Module {

  static register(options): DynamicModule {
    return {
      module: Logger2Module,
      providers: [
        MyLogger,
        {
          provide: 'LOG_OPTIONS',
          useValue: options
        }
      ],
      exports: [MyLogger, 'LOG_OPTIONS']
    }
  }
}
```
```js
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyLogger3 } from './MyLogger3';
import { LoggerModule } from './logger/logger.module';  // 全局注册模块
import { AaaModule } from './aaa/aaa.module';
import { Logger2Module } from './logger2/logger2.module'; // 动态模块

@Module({
  imports: [LoggerModule, AaaModule, 
    Logger2Module.register({ // 动态模块
      xxx: 1,
      yyy: 2
    })
  ],
  controllers: [AppController],
  providers: [AppService, MyLogger3],
})
export class AppModule {}
```
