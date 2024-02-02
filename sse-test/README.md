服务端实时推送数据，除了用 WebSocket 外，还可以用 HTTP 的 Server Sent Event。

只要 http 返回 Content-Type 为 text/event-stream 的 header，就可以通过 stream 的方式多次返回消息了。

它传输的是 json 格式的内容，可以用来传输文本或者二进制内容。

我们通过 Nest 实现了 sse 的接口，用 @Sse 装饰器标识方法，然后返回 Observe 对象就可以了。内部可以通过 observer.next 随时返回数据。

前端使用 EventSource 的 onmessage 来接收消息。

这个 api 的兼容性很好，除了 ie 外可以放心的用。

它的应用场景有很多，比如站内信、构建日志实时展示、chatgpt 的消息返回等。

再遇到需要消息推送的场景，不要直接 WebSocket 了，也许 Server Sent Event 更合适呢？

### Server Sent Event

服务端返回的 Content-Type 是 `text/event-stream`，这是一个流，可以多次返回内容。

Sever Sent Event 就是通过这种消息来随时推送数据。

```ts
import { Controller, Get, Sse } from '@nestjs/common';
import { AppService } from './app.service';
import { Observable } from 'rxjs';
import { exec } from 'child_process';
import { readFileSync } from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
  //通过 child_process 模块的 exec 来执行这个命令，然后监听它的 stdout 输出：
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
```
