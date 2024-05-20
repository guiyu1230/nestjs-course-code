这节我们学习了 Nest 实现 WebSocket 服务。

需要用到 @nestjs/websockets 和 @nestjs/platform-socket.io 包。

涉及到这些装饰器：

- @WebSocketGateWay：声明这是一个处理 weboscket 的类。

- @SubscribeMessage：声明处理的消息。

- @MessageBody：取出传过来的消息内容。

- @WebSocketServer：取出 Socket 实例对象

- @ConnectedSocket：取出 Socket 实例对象注入方法

客户端也是使用 socket.io 来连接。

如果想异步返回消息，就通过 rxjs 的 Observer 来异步多次返回。

整体来说，Nest 里用 WebSocket 来做实时通信还是比较简单的。

### 搭建websocket服务
```
nest new nest-websocket

npm i --save @nestjs/websockets @nestjs/platform-socket.io

nest g resource aaa
# 选择websocket服务
```

- 分别指定 event 和 data。
接收`findAllAaa`消息. 发送给`guang`
```js
@SubscribeMessage('findAllAaa')
findAll() {
  return {
    event: 'guang',
    data: this.aaaService.findAll()
  }
}
```

使用`rxjs的Observer`连续发送多个消息
```js
@SubscribeMessage('findAllAaa')
findAll() {
    return new Observable((observer) => {
      observer.next({ event: 'guang', data: { msg: 'aaa'} });

      setTimeout(() => {
        observer.next({ event: 'guang', data: { msg: 'bbb'} });
      }, 2000);

      setTimeout(() => {
        observer.next({ event: 'guang', data: { msg: 'ccc'} });
      }, 5000);
    });
}
```

- 注入实例来通信

```js
// npm install socket.io

@SubscribeMessage('findOneAaa')
findOne(@MessageBody() id: number, @ConnectedSocket() server: Server) {
    // 也可以申明入参 @ConnectedSocket() server: Server
    server.emit('guang', 666);
    return this.aaaService.findOne(id);
}

// 也可以注入实例
@WebSocketServer()
server: Server;

@SubscribeMessage('createAaa')
create(@MessageBody() createAaaDto: CreateAaaDto) {
    this.server.emit('guang', 777);
    return this.aaaService.create(createAaaDto);
}
```

- 申明生命周期
```js
@WebSocketGateway()
export class AaaGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{

  handleDisconnect(client: Server) {
  }

  handleConnection(client: Server, ...args: any[]) {
  }
    
  afterInit(server: Server) {
  }
}
```

#### 完整代码
```js
// aaa.gateway.ts
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { AaaService } from './aaa.service';
import { CreateAaaDto } from './dto/create-aaa.dto';
import { UpdateAaaDto } from './dto/update-aaa.dto';
import { Observable } from 'rxjs';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AaaGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly aaaService: AaaService) {}

  handleDisconnect(client: any) {
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('handleConnection')
  }

  afterInit(server: any) {
    console.log('afterInit')
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createAaa')
  create(@MessageBody() createAaaDto: CreateAaaDto) {
    this.server.emit('guang', 777);
    return this.aaaService.create(createAaaDto);
  }

  @SubscribeMessage('findAllAaa')
  findAll() {
    // return {
    //   event: 'guang',
    //   data: this.aaaService.findAll()
    // }

    return new Observable(observer => {
      observer.next({ event: 'guang', data: {msg: 'aaa'} });

      setTimeout(() => {
        observer.next({ event: 'guang', data: {msg: 'bbb'} });
      }, 2000);

      setTimeout(() => {
        observer.next({ event: 'guang', data: {msg: 'ccc'} });
      }, 5000);
    })
  }

  @SubscribeMessage('findOneAaa')
  findOne(@MessageBody() id: number, @ConnectedSocket() server: Server) {

    server.emit('guang', 666)
    return this.aaaService.findOne(id);
  }

  @SubscribeMessage('updateAaa')
  update(@MessageBody() updateAaaDto: UpdateAaaDto) {
    return this.aaaService.update(updateAaaDto.id, updateAaaDto);
  }

  @SubscribeMessage('removeAaa')
  remove(@MessageBody() id: number) {
    return this.aaaService.remove(id);
  }
}
```

```html
<html>
  <head>
    <script src="https://cdn.socket.io/4.3.2/socket.io.min.js" integrity="sha384-KAZ4DtjNhLChOB/hxXuKqhMLYvx3b5MlT55xPEiNmREKRzeEm+RVPlTnAn0ajQNs" crossorigin="anonymous"></script>
    <script>
      const socket = io('http://localhost:3000');
      socket.on('connect', function() {
        console.log('Connected');

        socket.emit('findAllAaa', response =>
          console.log('findAllAaa', response),
        );

        socket.emit('findOneAaa', 1, response =>
          console.log('findOneAaa', response),
        );

        socket.emit('createAaa', {name: 'guang'},response =>
          console.log('createAaa', response),
        );

        socket.emit('updateAaa',{id: 2, name: 'dong'},response =>
          console.log('updateAaa', response),
        );

        socket.emit('removeAaa', 2,response =>
          console.log('removeAaa', response),
        );

        socket.on('guang', function(data) {
          console.log('guang', data)
        });
      });
      socket.on('disconnect', function() {
        console.log('Disconnected');
      });
    </script>
  </head>

  <body></body>
</html>
```