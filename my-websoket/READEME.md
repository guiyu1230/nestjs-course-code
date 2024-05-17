实时性较高的需求，我们会用 websocket 实现，比如即时通讯、游戏等场景。

websocket 和 http 没什么关系，但从 http 到 websocket 需要一次切换的过程。

这个切换过程除了要带 upgrade 的 header 外，还要带 sec-websocket-key，服务端根据这个 key 算出结果，通过 sec-websocket-accept 返回。响应是 101 Switching Protocols 的状态码。

这个计算过程比较固定，就是 key + 固定的字符串 通过 sha1 加密后再 base64 的结果。

加这个机制是为了确保对方一定是 websocket 服务器，而不是随意返回了个 101 状态码。

之后就是 websocket 协议了，这是个二进制协议，我们根据格式完成了 websocket 帧的解析和生成。

这样就是一个完整的 websocket 协议的实现了。

我们自己手写了一个 websocket 服务，有没有感觉对 websocket 的理解更深了呢？

### 用Nodejs手写websocket协议
- 切换协议的过程，http协议切换为websocket协议
- 二进制的 weboscket 协议数据的收发。

WebSocket 严格来说和 HTTP 没什么关系，是另外一种协议格式。但是需要一次从 HTTP 到 WebSocket 的切换过程。

![websocket协议](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/66a631eacea541b8a21077f3a70a7d30~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp)

websocket的header设置
```sh
# 请求头要携带
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Key: Ia3dQjfWrAug/6qm7mTZOg==

# 响应头返回
HTTP/1.1 101 Switching Protocols
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Accept: JkE58n3uIigYDMvC+KsBbGZsp1A=
```

`Sec-WebSocket-Key`经过计算得到`Sec-WebSocket-Accept`
```js
const crypto = require('crypto');

function hashKey(key) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
  return sha1.digest('base64');
}
```

#### 手写websocket协议
```js
//ws.js
const { EventEmitter } = require('events');
const http = require('http');
const crypto = require('crypto');

function hashKey(key) {
  const sha1 = crypto.createHash('sha1');
  sha1.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
  return sha1.digest('base64');
}

function handleMask(maskBytes, data) {
  const payload = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    payload[i] = maskBytes[i % 4] ^ data[i];
  }
  return payload;
}

const OPCODES = {
  CONTINUE: 0,
  TEXT: 1,
  BINARY: 2,
  CLOSE: 8,
  PING: 9,
  PONG: 10,
};

function encodeMessage(opcode, payload) {
  //payload.length < 126
  let bufferData = Buffer.alloc(payload.length + 2 + 0);;
  
  let byte1 = parseInt('10000000', 2) | opcode; // 设置 FIN 为 1
  let byte2 = payload.length;

  bufferData.writeUInt8(byte1, 0);
  bufferData.writeUInt8(byte2, 1);

  payload.copy(bufferData, 2);
  
  return bufferData;
}

class MyWebsocket extends EventEmitter {
  constructor(options) {
    super(options);

    const server = http.createServer();
    server.listen(options.port || 8080);

    server.on('upgrade', (req, socket) => {
      this.socket = socket;
      socket.setKeepAlive(true);

      const resHeaders = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Accept: ' + hashKey(req.headers['sec-websocket-key']),
        '',
        ''
      ].join('\r\n');
      socket.write(resHeaders);

      socket.on('data', (data) => {
        // 二进制数据解码
        this.processData(data);
        // console.log(data);
      });
      socket.on('close', (error) => {
          this.emit('close');
      });
    });
  }

  handleRealData(opcode, realDataBuffer) {
    switch (opcode) {
      case OPCODES.TEXT:
        this.emit('data', realDataBuffer.toString('utf8'));
        break;
      case OPCODES.BINARY:
        this.emit('data', realDataBuffer);
        break;
      default:
        this.emit('close');
        break;
    }
  }

  processData(bufferData) {
    const byte1 = bufferData.readUInt8(0);
    let opcode = byte1 & 0x0f; 
    
    const byte2 = bufferData.readUInt8(1);
    const str2 = byte2.toString(2);
    const MASK = str2[0];

    let curByteIndex = 2;
    
    let payloadLength = parseInt(str2.substring(1), 2);
    if (payloadLength === 126) {
      payloadLength = bufferData.readUInt16BE(2);
      curByteIndex += 2;
    } else if (payloadLength === 127) {
      payloadLength = bufferData.readBigUInt64BE(2);
      curByteIndex += 8;
    }

    let realData = null;
    
    if (MASK) {
      const maskKey = bufferData.slice(curByteIndex, curByteIndex + 4);  
      curByteIndex += 4;
      const payloadData = bufferData.slice(curByteIndex, curByteIndex + payloadLength);
      realData = handleMask(maskKey, payloadData);
    } 
    
    this.handleRealData(opcode, realData);
  }

  send(data) {
    let opcode;
    let buffer;
    if (Buffer.isBuffer(data)) {
      opcode = OPCODES.BINARY;
      buffer = data;
    } else if (typeof data === 'string') {
      opcode = OPCODES.TEXT;
      buffer = Buffer.from(data, 'utf8');
    } else {
      console.error('暂不支持发送的数据类型')
    }
    this.doSend(opcode, buffer);
  }

  doSend(opcode, bufferDatafer) {
    this.socket.write(encodeMessage(opcode, bufferDatafer));
  }
}

module.exports = MyWebsocket;
```


```js
// node.js 服务端启动websocket
const MyWebSocket = require('./ws');
const ws = new MyWebSocket({ port: 8080 });

ws.on('data', (data) => {
  console.log('receive data:' + data);
  setInterval(() => {
    ws.send(data + ' ' + Date.now());
  }, 2000)
});

ws.on('close', (code, reason) => {
  console.log('close:', code, reason);
});

// 客户端调用websocket
<!DOCTYPE HTML>
<html>
<body>
    <script>
        const ws = new WebSocket("ws://localhost:8080");

        ws.onopen = function () {
            ws.send("发送数据");
            setTimeout(() => {
                ws.send("发送数据2");
            }, 3000)
        };

        ws.onmessage = function (evt) {
            console.log(evt)
        };

        ws.onclose = function () {
        };
    </script>
</body>
</html>
```