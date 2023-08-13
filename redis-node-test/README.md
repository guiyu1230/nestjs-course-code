### 使用redis

因为用到了 es module、顶层 await，这些的启用需要在 package.json 里添加 type: module

```
npm install redis
```

```js
// index.js
import { createClient } from 'redis';

const client = createClient({
    socket: {
        host: 'localhost',
        port: 6379
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

const value = await client.keys('*');

console.log(value);

await client.disconnect();
```

### 使用ioredis

```
npm install ioredis
```

```js
import Redis from "ioredis";

const redis = new Redis();

const res = await redis.keys('*');

console.log(res);
```