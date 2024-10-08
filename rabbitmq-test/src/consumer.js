import * as amqp from 'amqplib';

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();

// const { queue } = await channel.assertQueue('aaa');
// channel.consume(queue, msg => {
//   console.log(msg.content.toString())
// }, { noAck: true });

// 消费者每 1s 处理一条消息：
const { queue } = await channel.assertQueue('aaa');
channel.prefetch(3);

const currentTask = [];
channel.consume(queue, msg => {
    currentTask.push(msg);
    console.log('收到消息：', msg.content.toString());
}, { noAck: false });

setInterval(() => {
    const curMsg = currentTask.pop();
    channel.ack(curMsg);
}, 1000);