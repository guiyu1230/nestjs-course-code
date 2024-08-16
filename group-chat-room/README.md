### 基于Socket.io的room实现群聊

主要是基于 socket.io 的 room 实现的，可以把 client socket 加入某个 room，然后向这个 room 发消息。

这样，发消息的时候带上昵称、群聊名等内容，就可以往指定群聊发消息了。

更完善的聊天室，会带上 userId、groupId 等，然后可以根据这俩 id 查询更详细的信息，但只是消息格式更复杂一些，原理都是 room。

```js
// socket.io 支持加入房间：
socket.join('room666')
// 向客户端所在房间发送信息
server.to("room666").emit("新成员加入了群聊")

```

#### 群聊消息实现
#### 服务端实现
- 实现`joinRoom`加入房间路由. 实现`client.join(payload.roomName)`加入房间
- 实现`sendMessage`接收消息路由. 向房间`this.server.to(payload.room).emit('message', payload.message)`发送消息
```js
import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatroomGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('joinRoom')
  joinRoom(client: Socket, payload: any): void {
    console.log(payload.roomName);
    // 加入房间
    client.join(payload.roomName);
    // 向房间发送消息
    this.server.to(payload.roomName).emit('message', {
      nickName: payload.nickName,
      message: `${payload.nickName} 加入了 ${payload.roomName} 房间`
    });
  }

  @SubscribeMessage('sendMessage')
  sendMessage(client: Socket, payload: any): void {
    console.log(payload);
    // 接收消息. 向房间发送消息
    this.server.to(payload.room).emit('message', { nickName: payload.nickName, message: payload.message});
  }
}
```

#### 客户端实现
- 实现`socket.on('connect', callback)`连接
- 实现`socket.emit('joinRoom', { roomName, nickName })`加入房间
- 实现`socket.on('message', callback)`接收房间信息
- 实现`socket.emit('sendMessage', { room, nickName, message })`发送消息
- 实现`socket.on('disconnect', callback)`退出房间

```html
<html>
  <head>
    <script src="https://cdn.socket.io/4.3.2/socket.io.min.js"></script>
  </head>
  <body>
    <div id="messageBox"></div>
    <input id="messageInput"/>
    <button id="sendMessage">发送</button>

    <script>
      const messageBox = document.getElementById('messageBox');
      const messageInput = document.getElementById('messageInput');
      const sendMessage = document.getElementById('sendMessage');

      const roomName = prompt('输入群聊名');
      const nickName = prompt('输入昵称');
      if(roomName && nickName) {
        const socket = io('http://localhost:3000');
        socket.on('connect', function() {
          console.log('Connected');

          socket.emit('joinRoom', { roomName, nickName });
          
          socket.on('message', (payload) => {
            console.log('收到来自房间的消息:', payload);

            const item = document.createElement('div');
            item.className = 'message'
            item.textContent = payload.nickName + ':  ' + payload.message;
            messageBox.appendChild(item);
          });
        });

        sendMessage.onclick = function() {
          socket.emit('sendMessage', { room: roomName, nickName, message: messageInput.value });
          messageInput.value = '';
        }

        socket.on('disconnect', function() {
          console.log('Disconnected');
        });
      }
    </script>
  </body>
</html>
```