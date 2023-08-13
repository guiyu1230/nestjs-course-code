import { createClient } from 'redis';

const client = createClient({
  socket: {
    host: 'localhost',
    port: 6379
  }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

// const value = await client.keys('*');

// console.log(value);

await client.hSet('guangguang1', '111', 'value111');

await client.hSet('guangguang1', '222', 'value222');

await client.hSet('guangguang1', '333', 'value333');

// const hget1 = await client.hGet('guangguang1', '111');

// const hget2 = await client.hGet('guangguang1', '222');

// const hget3 = await client.hGet('guangguang1', '333');

const hget = await Promise.all([
  client.hGet('guangguang1', '111'),
  client.hGet('guangguang1', '222'),
  client.hGet('guangguang1', '333')
]);

console.log(hget);

await client.disconnect();