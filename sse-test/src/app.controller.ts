import { Controller, Get, Sse } from '@nestjs/common';
import { AppService } from './app.service';
import { Observable } from 'rxjs';
import { exec } from 'child_process';
import { readFileSync } from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Sse('stream')
  stream() {
    return new Observable((observer) => {
      const messages = [
        { data: { msg: 'aaa' } },
        { data: { msg: 'bbb' } },
        { data: { msg: 'ccc' } },
        { data: { msg: 'finish' } }
      ];

      let index = 0;
      const interval = setInterval(() => {
        if (index < messages.length) {
          observer.next(messages[index]);
          index++;
        } else {
          observer.complete(); // 发送完所有消息后，通知观察者流结束
          clearInterval(interval); // 清除定时器
        }
      }, 2000);
    });
  }

  @Sse('stream2')
  stream2() {
    const childProcess = exec('tail -f ./log');
    return new Observable((observer) => {
      childProcess.stdout.on('data', (msg) => {
        observer.next({ data: { msg: msg.toString() }});
      })
    });
  }

  @Sse('stream3')
  stream3() {
    return new Observable((observer) => {
      const json = readFileSync('./package.json').toJSON();
      observer.next({ data: { msg: json }});
    });
  }
}
