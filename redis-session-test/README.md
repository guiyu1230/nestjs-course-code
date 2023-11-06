redis 的 hash 有这些方法：

- `HSET key field value`： 设置指定哈希表 key 中字段 field 的值为 value。
- `HGET key field`：获取指定哈希表 key 中字段 field 的值。
- `HMSET key field1 value1 field2 value2 ...`：同时设置多个字段的值到哈希表 key 中。
- `HMGET key field1 field2 ...`：同时获取多个字段的值从哈希表 key 中。
- `HGETALL key`：获取哈希表 key 中所有字段和值。
- `HDEL key field1 field2 ...`：删除哈希表 key 中一个或多个字段。
- `HEXISTS key field`：检查哈希表 key 中是否存在字段 field。
- `HKEYS key`：获取哈希表 key 中的所有字段。
- `HVALUES key`：获取哈希表 key 中所有的值。 -HLEN key：获取哈希表 key 中字段的数量。
- `HINCRBY key field increment`：将哈希表 key 中字段 field 的值增加 increment。
- `HSETNX key field value`：只在字段 field 不存在时，设置其值为 value。

### redisService生成
```js
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {

    @Inject('REDIS_CLIENT') 
    private redisClient: RedisClientType;

    async hashGet(key: string) {
        return await this.redisClient.hGetAll(key);
    }

    async hashSet(key: string, obj: Record<string, any>, ttl?: number) {
        for(let name in obj) {
            await this.redisClient.hSet(key, name, obj[name]);
        }

        if(ttl) {
            await this.redisClient.expire(key, ttl);
        }
    }
}
```

session 是在服务端内存存储会话数据，通过 cookie 中的 session id 关联。

但它不支持分布式，换台机器就不行了。

jwt 是在客户端存储会话数据，所以天然支持分布式。

我们通过 redis 自己实现了分布式的 session。

我们使用的是 hash 的数据结构，封装了 RedisModule 来操作 Redis。

又封装了 SessionModule 来读写 redis 中的 session，以 sid_xxx 为 key。

之后在 ctronller 里就可以读取和设置 session 了，用起来和内置的传统 session 差不多。但是它是支持分布式的。

如果你想在分布式场景下用 session，就自己基于 redis 实现一个吧。

### 总结
1. 使用`nest g module redis`生成redis模块.并全局注册
2. 使用`nest g module session`生成session模块(会引用redis模块). 并全局注册
3. 在`sessionService`实现`setSession`和`getSession`方法
4. 实现`/count`接口. 把cookie `sid`保存到`分布式session`

```js
@Get('count')
async count(@Req() req: Request, @Res({ passthrough: true}) res: Response) {
    const sid = req.cookies?.sid;

    const session = await this.sessionService.getSession<{count: string}>(sid);

    const curCount = session.count ? parseInt(session.count) + 1 : 1;
    const curSid = await this.sessionService.setSession(sid, {
      count: curCount
    });

    res.cookie('sid', curSid, { maxAge: 1800000 });
    return curCount;
}
```