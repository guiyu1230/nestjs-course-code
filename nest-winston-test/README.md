这节我们集成了 nest 和 winston。

前面我们学过了如何自定义 Nest 的 logger，现在只要在 Logger 的实现里改成 winston 的 logger 就好了。

只是想要保持 nest 原本日志的格式，需要用 printf 自定义。我们使用 dayjs + chalk 自定义了 winston 的日志格式。

当然，打印到 File 的日志，依然是 json 的。

之后封装了个动态模块，在 forRoot 方法里传入 options，模块内创建 winston 的 logger 实例。并且这个模块声明为全局模块。

这样，在应用的各处都可以注入我们自定义的基于 winston 的 logger 了。

### 创建`winston`模块
`nest g module winston`

```js
// src/winston/MyLogger.ts
import { LoggerService, LogLevel } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { createLogger, format, Logger, transports } from 'winston'

export class MyLogger implements LoggerService {

  private logger: Logger;

  constructor(options) {
    this.logger = createLogger(options)
  }

  log(message: string, context: string) {
    const time = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    this.logger.log('info', message, { context, time });
  }

  error(message: string, context: string) {
    const time = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    this.logger.log('error', message, { context, time });
  }

  warn(message: string, context: string) {
    const time = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    this.logger.log('warn', message, { context, time });
  }
}

// src/winston/winston.module.ts
import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerOptions, createLogger } from 'winston'
import { MyLogger } from './MyLogger';

export const WINSTON_LOGGER_TOKEN = 'WINSTON_LOGGER';

@Global()
@Module({})
export class WinstonModule {

  public static forRoot(options: LoggerOptions): DynamicModule {
    return {
      module: WinstonModule,
      providers: [
        {
          provide: WINSTON_LOGGER_TOKEN,
          useValue: new MyLogger(options)
        }
      ],
      exports: [
        WINSTON_LOGGER_TOKEN
      ]
    }
  }
}
```

### 将`winston`模块在`app.module.ts`注册
```js
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WinstonModule } from './winston/winston.module';
import { transports, format } from 'winston';
import * as chalk from 'chalk';

@Module({
  imports: [WinstonModule.forRoot({
    level: 'debug',
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(({context, level, message, time}) => {
            const appStr = chalk.green(`[NEST]`);
            const contextStr = chalk.yellow(`[${context}]`);

            return `${appStr} ${time} ${level} ${contextStr} ${message}`;
          })
        )
      }),
      new transports.File({
        format: format.combine(
          format.json()
        ),
        filename: '111.log',
        dirname: 'log'
      })
    ]    
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 模块使用
```js
// main.ts
import { WINSTON_LOGGER_TOKEN } from './winston/winston.module';
const app = await NestFactory.create(AppModule);
app.useLogger(app.get(WINSTON_LOGGER_TOKEN));

// app.controller.ts
@Inject(WINSTON_LOGGER_TOKEN)
private logger;

this.logger.log('hello', AppController.name);
```
