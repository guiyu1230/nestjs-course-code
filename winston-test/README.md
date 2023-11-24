Node 服务端我们不会用 console.log 打印日志，而是会用日志框架，比如 winston。

winston 支持 tranport 配置，可以把日志传输到 console、file、通过 http 发送到别的服务，写入 mongodb 数据库等。

社区有很多 transport 可用，我们尝试了滚动日志的 transport，可以根据日期来自动分割日志文件。

winston 还支持 level 配置，可以根据级别来过滤日志。

而且还支持 format 的设置，比如 json、simple、label、timstamp 等，一般我们输出到文件里的都是 json 格式，并且给他加上时间戳和 label，这样方便之后分析。

每个 transport 都可以单独指定 format，而且还可以创建多个 logger，每个 logger 用不同的配置。

此外，winston 还支持指定未捕获的 error 的日志怎么处理。

总之，相比直接 console.log，用 winston 这样的灵活强大的日志框架可太香了。

### 按日期切割日志
```js
import winston from 'winston';
import 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    // 日志按日期格式切割
    new winston.transports.DailyRotateFile({
      level: 'info',
      dirname: 'log2',
      filename: 'test-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH-mm',
      maxSize: '1k'
    })
  ]
});

logger.info('光光光光光光光光光');
logger.error('东东东东东东东东');
logger.debug(66666666);
```

### 控制台和日志分别设置打印
```js
import winston from "winston";

winston.loggers.add('console', {
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console()
  ]
});

winston.loggers.add('file', {
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      dirname: 'log4',
      filename: 'test.log',
      format: winston.format.json()
    })
  ]
});

const logger1 = winston.loggers.get('console');

logger1.info('aaab');
logger1.error('bbbb');

const logger2 = winston.loggers.get('file');

logger2.info('xxxx');
logger2.error('yyyy');
```
