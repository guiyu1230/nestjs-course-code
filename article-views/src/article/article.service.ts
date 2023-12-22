import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Article } from './entities/article.entity';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ArticleService {

  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(RedisService)
  private redisService: RedisService;

  async findOne(id: number) {
    return await this.entityManager.findOneBy(Article, {
      id
    });
  }

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

      await this.redisService.set(`user_${userId}_article_${id}`, 1, 3);

      return article.viewCount;
    } else {
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

  async flushRedisToDB() {
    const keys = await this.redisService.keys(`article_*`);
    console.log(keys);

    for(let i = 0; i < keys.length; i++) {
      const key = keys[i];

      const res = await this.redisService.hashGet(key);

      const [, id] = key.split('_');

      await this.entityManager.update(Article, {
        id
      }, {
        viewCount: +res.viewCount,
      });
    }
  }
}
