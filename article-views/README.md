### entityManager.save和entityManager.update区别

`this.entityManager.save(User)` 会执行一次`query查询`.  如果有数据就会做`update修改`. 没有就`insert插入`

如果在执行`this.entityManager.findOne`后有结果. 就一定用`this.entityManager.update`代替`this.entityManager.save`

### 复习

我们通过 redis + 定时任务实现了阅读量计数的功能。

因为阅读是个高频操作，所以我们查出数据后存在 redis里，之后一直访问 redis 的数据，然后通过定时任务在凌晨 4 点把最新数据写入数据库。

并且为了统计真实的用户阅读量，我们在 redis 存储了用户看了哪篇文章的标识，10 分钟后过期。

这就是我们常见的阅读量功能的实现原理。


1. 安装`npm install --save @nestjs/typeorm typeorm mysql2`
2. 创建`user`和`article`表
3. 安装`npm install express-session @types/express-session`使用session登录
4. 写入`user`登录逻辑和`article`查看文章和`article/view`阅读次数
5. 安装`npm install --save redis` 写入redis配置

```js
// redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {

    @Inject('REDIS_CLIENT') 
    private redisClient: RedisClientType;

    async keys(pattern: string) {
        return await this.redisClient.keys(pattern);
    }

    async get(key: string) {
        return await this.redisClient.get(key);
    }

    async set(key: string, value: string | number, ttl?: number) {
        await this.redisClient.set(key, value);

        if(ttl) {
            await this.redisClient.expire(key, ttl);
        }
    }

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

6. `article/view`阅读次数配置redis缓存
```js
// article.service.ts
@Inject(RedisService)
private redisService: RedisService;

async view(id: number, userId: string) {
  const res = await this.redisService.hashGet(`article_${id}`);

  if(res.viewCount === undefined) {
    const article = await this.findOne(id);

    article.viewCount ++;
    // 用update代替save
    // 因为 findOne 发一条 select，save 会先发一条 select，再发一条 update。
    await this.entityManager.update(Article, { id }, {
      viewCount: article.viewCount
    });

    await this.redisService.hashSet(`article_${id}`, {
      viewCount: article.viewCount,
      likeCount: article.likeCount,
      collectCount: article.collectCount
    });
    // 10分钟缓存 不计入重复次数
    await this.redisService.set(`user_${userId}_article_${id}`, 1, 10 * 60);

    return article.viewCount;
  } else {
    // 10分钟缓存 不计入重复次数
    const flag = await this.redisService.get(`user_${userId}_article_${id}`);

    if(flag) {
      return res.viewCount;
    }

    await this.redisService.hashSet(`article_${id}`, {
      ...res,
      viewCount: +res.viewCount + 1
    });

    await this.redisService.set(`user_${userId}_article_${id}`, 1, 3);

    return +res.viewCount + 1;
  }
}

// 自动任务 自动同步数据库
async flushRedisToDB() {
  const keys = await this.redisService.keys(`article_*`);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    const res = await this.redisService.hashGet(key);

    const [, id] = key.split('_');

    await this.entityManager.update(Article, {
      id: +id
    }, {
      viewCount: +res.viewCount,        
    });
  }
}
```

7. 安装`npm install --save @nestjs/schedule`

```js
// app.module.ts
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TaskModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// task.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class TaskService {

  @Inject(ArticleService)
  private articleService: ArticleService;

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleCron() {
    // 自动任务 自动同步数据库
    await this.articleService.flushRedisToDB();
  }
}
```
