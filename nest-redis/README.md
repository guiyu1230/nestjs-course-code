通过 redis 的 npm 包（redis、ioredis 等）可以连接 redis server 并执行命令。

如果在 nest 里，可以通过 useFactory 动态创建一个 provider，在里面使用 redis 的 npm 包创建连接。

redis 是必备的中间件，后面的项目实战会大量用到。

```js
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { createClient } from 'redis';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const client = createClient({
          socket: {
            host: 'localhost',
            port: 6379
          }
        })
        await client.connect();
        return client;
      }
    }
  ],
})
export class AppModule {}

// app.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class AppService {

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  async getHello(): Promise<string> {
    const value = await this.redisClient.keys('*');
    console.log(value);
    
    return 'Hello World!';
  }
}
```