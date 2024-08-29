### 前端监控系统使用RabbitMQ

rabbitmq 解决了什么问题：

- **流量削峰**：可以把很大的流量放到 mq 种按照一定的流量上限来慢慢消费，这样虽然慢一点，但不至于崩溃。
- **应用解耦**：应用之间不再直接依赖，就算某个应用挂掉了，也可以再恢复后继续从 mq 中消费消息。并不会一个应用挂掉了，它关联的应用也挂掉。

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a89ebbdbe9054f698d926b10a1476e0b~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp" />

`Producer` 和 `Consumer` 分别是生产者和消费者。

`Connection` 是连接，但我们不会每用一次 `rabbitmq` 就创建一个单独的 `Connection`，而是在一个 `Connection` 里做一下划分，叫做 `Channel`，每个 `Channel` 做自己的事情。

而 `Queue` 就是两端存取消息的地方了。

整个接收消息和转发消息的服务就叫做 `Broker`。

至于 `Exchange`，我们前面的例子没有用到，这个是把消息放到不同的队列里用的，叫做交换机。

我们前面生产者和消费者都是直接指定了从哪个队列存取消息，那如果是一对多的场景呢？

总不能一个个的调用 `sendQueue` 发消息吧？

这时候就要找一个 `Exchange`（交换机） 来帮我们完成把消息按照规则放入不同的 Queue 的工作了。

Exchange 主要有 4 种：

- `fanout`：把消息放到这个交换机的所有 Queue
- `direct`：把消息放到交换机的指定 key 的队列
- `topic`：把消息放到交换机的指定 key 的队列，支持模糊匹配
- `headers`：把消息放到交换机的满足某些 header 的队列

```js
// 基础用法
// producer.js 生产者
import * as amqp from 'amqplib'

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();

// 最简单发送
// await channel.assertQueue('aaa');
// await channel.sendToQueue('aaa',Buffer.from('hello'))

// 生产者每 0.5s 发送一次消息。
await channel.assertQueue('aaa');

let i = 1;
setInterval(async () => {
  const msg = 'hello' + i;
  console.log('发送消息：', msg);
  await channel.sendToQueue('aaa',Buffer.from(msg.toString()))
  i++;
}, 500)

// consumer.js 消费者
import * as amqp from 'amqplib';

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();

// const { queue } = await channel.assertQueue('aaa');
// channel.consume(queue, msg => {
//   console.log(msg.content.toString())
// }, { noAck: true });

// 消费者每 1s 处理一条消息：
const { queue } = await channel.assertQueue('aaa');
// 3个消息并发
channel.prefetch(3);

const currentTask = [];
// 订阅消息
channel.consume(queue, msg => {
    currentTask.push(msg);
    console.log('收到消息：', msg.content.toString());
}, { noAck: false });

setInterval(() => {
    const curMsg = currentTask.pop();
    // noAck 设置为 false. 手动确认
    channel.ack(curMsg);
}, 1000);
```

Exchange 主要有 4 种：

- `fanout`：把消息放到这个交换机的所有 Queue
- `direct`：把消息放到交换机的指定 key 的队列
- `topic`：把消息放到交换机的指定 key 的队列，支持模糊匹配
- `headers`：把消息放到交换机的满足某些 header 的队列

#### 消息队列一对多群发. 使用exchange
```js
// producer 消息生产
import * as amqp from 'amqplib'

// 创建amqp连接
const connect = await amqp.connect(`amqp://localhost:5672`);
// 创建channel
const channel = await connect.createChannel();
// 创建exchange交换机 (topic | direct | topic | headers)类型
await channel.assertExchange('direct-test-exchange2', 'topic'); // topic | direct | topic | headers
// 使用交换机根据name和routing key群发消息
// channel.publish(name, routKey, content)
channel.publish('direct-test-exchange2', 'aaa.1', Buffer.from('hello1'))
channel.publish('direct-test-exchange2', 'aaa.2', Buffer.from('hello2'))
channel.publish('direct-test-exchange2', 'bbb.1', Buffer.from('hello3'))

// consumer 消息订阅
import * as amqp from 'amqplib';

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();
// 创建名字为 queue1 的queue队列
const { queue } = await channel.assertQueue('queue1');
// queue队列绑定exchange交换机. 添加exchange消息源
await channel.bindQueue(queue, 'direct-test-exchange2', 'aaa.*');
// queue监听消息发送并消费消息
channel.consume(queue, msg => {
  console.log(msg.content.toString());
}, { noAck: true });
```