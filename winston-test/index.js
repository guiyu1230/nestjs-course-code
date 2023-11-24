import winston from 'winston';
import 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: 'debug',
  // format: winston.format.combine(
  //   winston.format.colorize(),
  //   winston.format.simple()
  // ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      dirname: 'log3',
      filename: 'test.log',
      format: winston.format.json()
    })
    // 1K文件切割
    // new winston.transports.File({
    //   dirname: 'log',
    //   filename: 'test.log',
    //   maxsize: 1024
    // })
    // 日志接口发送
    // new winston.transports.Http({
    //   host: 'localhost',
    //   port: '3000',
    //   path: '/log'
    // })
    // 日志按日期格式切割
    // new winston.transports.DailyRotateFile({
    //   level: 'info',
    //   dirname: 'log2',
    //   filename: 'test-%DATE%.log',
    //   datePattern: 'YYYY-MM-DD-HH-mm',
    //   maxSize: '1k'
    // })
  ]
});

logger.info('光光光光光光光光光');
logger.error('东东东东东东东东');
logger.debug(66666666);
