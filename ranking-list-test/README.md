### 基于Redis实现各种排行榜(周榜、月榜、年榜)

一般涉及到排行榜，都是用 Redis 来做，因为它有一个专为排行榜准备的数据结构：有序集合 ZSET。

- `ZADD`：往集合中添加成员
- `ZREM`：从集合中删除成员
- `ZCARD`：集合中的成员个数
- `ZSCORE`：某个成员的分数
- `ZINCRBY`：增加某个成员的分数
- `ZRANK`：成员在集合中的排名
- `ZRANGE`：打印某个范围内的成员
- `ZRANGESTORE`：某个范围内的成员，放入新集合
- `ZCOUNT`：集合中分数在某个返回的成员个数
- `ZDIFF`：打印两个集合的差集
- `ZDIFFSTORE`：两个集合的差集，放入新集合
- `ZINTER`：打印两个集合的交集
- `ZINTERSTORE`：两个集合的交集，放入新集合
- `ZINTERCARD`：两个集合的交集的成员个数
- `ZUNION`：打印两个集合的并集
- `ZUNIONSTORE`：两个集合的并集，放回新集合

```sh
# 往集合中添加成员和分数
ZADD set1 1 mem1 2 mem2 3 mem3

# 打印全部范围内的成员
# 默认是分数从小到大排序
# WITHSCORES 可携带分数展示
ZRANGE set1 0 -1

# 打印全部范围内的成员 从大到小排序
ZRANGE set1 0 -1 REV

# 把集合set1(0, -1)范围存入新的集合rangeset
ZRANGESTORE rangeset set1 0 -1

# 删除集合set1的成员mem1
ZREM set1 mem1

# 查看集合的成员个数
ZCARD set1

# 查看成员在集合内的排名
ZRANK set1 mem2

# 增加集中中成员mem2的分数(3)
ZINCRBY set1 3 mem2

# 往集合中添加成员和分数
ZADD set2 4 aaa 6 bbb

# 打印两个集合(set1, set2)的并集
# 还可以加上分数一起：
ZUNION 2 set1 set2

# 携带分数展示
# ["mem3", "3", "aaa", "4", "mem2", "5", "bbb", "6"]
ZUNION 2 set1 set2 WITHSCORES

# 把合并后放到另一个集合set3
# 有重复字段. 分数也合并
ZUNIONSTORE set3 2 set1 set2
```

#### 创建项目
```sh
nest new ranking-list-test

npm install --save redis

nest g module redis
nest g service redis

nest g module ranking
nest g controller ranking --no-spec
nest g service ranking --no-spec
```

#### 创建redis zset服务
```js
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {

    @Inject('REDIS_CLIENT') 
    private redisClient: RedisClientType;
    // 查看集合指定范围下的排名并携带分数
    async zRankingList(key: string, start: number = 0, end: number = -1) {
        // 查询集合内成员高到低排名的数组
        const keys = await this.redisClient.zRange(key, start, end, {
            REV: true
        });
        const rankingList = {};
        for(let i = 0; i< keys.length; i++){
            // 循环计算成员的分数
            rankingList[keys[i]] = await this.zScore(key, keys[i]);
        }
        return rankingList;
    }
    // zRangeWithScores方法等同于 zRange + zScore  
    // async zRankingList(key: string, start: number = 0, end: number = -1) {
    //     const newKeys = await this.redisClient.zRangeWithScores(key, start, end, {
    //       REV: true
    //     });
    //     return newKeys;
    // }
    // 给集合的字段添加分数
    async zAdd(key: string, members: Record<string, number>) {
        const mems = [];
        for(let key in members) {
            mems.push({
                value: key,
                score: members[key]
            });        
        }
        return  await this.redisClient.zAdd(key, mems);
    }
    // 查询集合的字段的分数
    async zScore(key: string, member: string) {
        return  await this.redisClient.zScore(key, member);
    }
    // 查询成员在集合内的排名
    async zRank(key: string, member: string) {
        return  await this.redisClient.zRank(key, member);
    }

    // 增加集合指定成员具体分数
    async zIncr(key: string, member: string, increment: number) {
        return  await this.redisClient.zIncrBy(key, increment, member)
    }

    // 合并多个集合为新的集合.并返回新集合排行信息
    async zUnion(newKey: string, keys: string[]) {
        if(!keys.length) {
            return []
        };
        if(keys.length === 1) {
            return this.zRankingList(keys[0]);
        }
        // 合并多个集合到新集合
        await this.redisClient.zUnionStore(newKey, keys);

        return this.zRankingList(newKey);
    }
    // 模糊查询有多少key字段
    async keys(pattern: string) {
        return this.redisClient.keys(pattern);    
    }
}
```

#### 基于redis zset实现排行榜服务rankingService

```js
import { RedisService } from './../redis/redis.service';
import { Inject, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';

@Injectable()
export class RankingService {

    @Inject(RedisService)
    redisService: RedisService;

    private getMonthKey() {
        const dateStr = dayjs().format('YYYY-MM');
        return `learning-ranking-month:${dateStr}`;
    }

    private getYearKey() {
        const dateStr = dayjs().format('YYYY');
        return `learning-ranking-year:${dateStr}`;
    }
    // 当前月用户加入排行
    async join(name: string) {
        await this.redisService.zAdd(this.getMonthKey(), { [name]: 0 });
    }
    // 当前月用户加入学习分数
    async addLearnTime(name:string, time: number) {
        await this.redisService.zIncr(this.getMonthKey(), name, time);
    }
    // 获取当前月用户的学习排行榜
    async getMonthRanking() {
        return this.redisService.zRankingList(this.getMonthKey(), 0, 10);
    }
    // 合并当年所有月排行榜并生成年排行榜
    async getYearRanking() {
        const dateStr = dayjs().format('YYYY');
        const keys = await this.redisService.keys(`learning-ranking-month:${dateStr}-*`);

        return this.redisService.zUnion(this.getYearKey(), keys);
    }
}
```

#### 实现排行榜的四个关键接口
- `localhost:3000/ranking/join?name=guang`: 用户加入排行榜
- `localhost:3000/ranking/learn?name=dong&time=1`: 指定用户加入学习分数
- `localhost:3000/ranking/monthRanking`: 计算当月排行榜
- `localhost:3000/ranking/yearRanking`: 计算当年排行榜