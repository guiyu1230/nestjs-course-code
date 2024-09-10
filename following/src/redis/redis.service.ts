import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  // 往集合中添加元素
  async sAdd(key: string, ...members: string[]) {
    return this.redisClient.sAdd(key, members);
  }

  // 求两个集合的交集创建新集合
  async sInterStore(newSetKey: string, set1: string, set2: string) {
    return this.redisClient.sInterStore(newSetKey, [set1, set2]);
  }

  // 判断元素是否在某个集合中
  async sIsMember(key: string, member: string) {
    return this.redisClient.sIsMember(key, member);
  }

  // 返回集合中的所有元素
  async sMember(key: string) {
    return this.redisClient.sMembers(key);
  }

  // 判断某个 key 是否存在
  async exists(key: string) {
    const result = await this.redisClient.exists(key);
    return result > 0;
  }
}
