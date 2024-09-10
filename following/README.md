### 实现关注关系: 关注的人、被关注的人、相互关注能力

在 mysql 里用中间表来存储 user 和 user 的关系，在 TypeORM 里用 @ManyToMany 映射。

互相关注用 redis 的 Set 来实现，先把 user 的 followers 和 following 存储到集合中。

然后把两个集合的交集求出来放入一个新的集合。

这样就能求出互相关注的关系。

当有新的关注或者取消关注时，除了要更新数据库外，也要顺便更新下 redis。

这样，查询互相关注关系的功能就完成了。

#### redis 的 Set 实现
- `SADD`：添加元素
- `SMEMBERS`：查看所有元素
- `SISMEMBER`：某个 key 是否在集合中
- `SCARD`：集合中某个 key 的元素数量
- `SMOVE`：移动元素从一个集合到另一个集合
- `SDIFF`：两个集合的差集
- `SINTER`：两个集合的交集
- `SUNION`：两个集合的并集
- `SINTERSTORE`：两个集合的交集，存入新集合
- `SUNIONSTORE`：两个集合的并集，存入新集合
- `SDIFFSTORE`：两个集合的差集，存入新集合

关注关系用 redis 来实现就是这样的：

比如张三 的 userId 是 1. 用一个 `set 来存储它的关注者 followers:1`

然后用一个集合来`存储他关注的人 following:1`

那相互关注的人就是 `followers:1 和 following:1 的交集 SINTERSTORE 的结果，存入新集合`

#### 创建项目
```sh
nest new follow
cd follow

npm install --save @nestjs/typeorm typeorm mysql2

nest g resource user --no-spec

npm install --save redis

nest g module redis
nest g service redis
```

- 创建用户多对多关系表
```js
// src/user/entity/user.entity.ts
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => User, user => user.following)
    @JoinTable()
    followers: User[];

    @ManyToMany(() => User, user => user.followers)
    following: User[];
}
```
- 对应生成的Mysql表
```sql
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT, 
  `name` varchar(255) NOT NULL, 
  PRIMARY KEY (`id`)
) ENGINE=InnoDB

CREATE TABLE `user_followers_user` (
  `userId_1` int NOT NULL, 
  `userId_2` int NOT NULL, 
  INDEX `IDX_26312a1e34901011fc6f63545e` (`userId_1`), 
  INDEX `IDX_110f993e5e9213a7a44f172b26` (`userId_2`), 
  PRIMARY KEY (`userId_1`, `userId_2`)
) ENGINE=InnoDB

ALTER TABLE `user_followers_user` ADD CONSTRAINT `FK_26312a1e34901011fc6f63545e2` FOREIGN KEY (`userId_1`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE `user_followers_user` ADD CONSTRAINT `FK_110f993e5e9213a7a44f172b264` FOREIGN KEY (`userId_2`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
```

- 执行初始化用户信息 `localhost:3000/user/init`
```sql
START TRANSACTION
query: INSERT INTO `user`(`id`, `name`) VALUES (DEFAULT, ?) -- PARAMETERS: ["李四"]
query: INSERT INTO `user`(`id`, `name`) VALUES (DEFAULT, ?) -- PARAMETERS: ["王五"]
query: INSERT INTO `user`(`id`, `name`) VALUES (DEFAULT, ?) -- PARAMETERS: ["赵六"]
query: INSERT INTO `user`(`id`, `name`) VALUES (DEFAULT, ?) -- PARAMETERS: ["刘七"]
query: COMMIT
query: START TRANSACTION
query: INSERT INTO `user`(`id`, `name`) VALUES (DEFAULT, ?) -- PARAMETERS: ["张三"]
query: INSERT INTO `user_followers_user`(`userId_1`, `userId_2`) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?) -- PARAMETERS: [5,1,5,2,5,3,1,5,4,5]
query: COMMIT
```

#### 创建redis模块服务以及set方法
- `SADD`：添加元素
- `SMEMBERS`：查看所有元素
- `SISMEMBER`：某个 key 是否在集合中
- `SINTERSTORE`：两个集合的交集，存入新集合
- `EXISTS`: 判断字段是否存在

```js
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {

    @Inject('REDIS_CLIENT') 
    private redisClient: RedisClientType;
    // 添加set元素
    async sAdd(key: string, ...members: string[]) {
        return this.redisClient.sAdd(key, members);
    }
    // 两个集合的交集，存入新集合
    async sInterStore(newSetKey: string, set1: string, set2: string) {
        return this.redisClient.sInterStore(newSetKey, [set1, set2]);
    }
    // 某个 key 是否在集合中
    async sIsMember(key: string, member: string) {
        return this.redisClient.sIsMember(key, member);
    }
    // 查看所有元素
    async sMember(key: string) {
        return this.redisClient.sMembers(key);
    }
    // 判断字段是否存在
    async exists(key: string) {
        const result =  await this.redisClient.exists(key);
        return result > 0
    } 
}
```

### 实现用户添加关注和查询关注关系
```js
// user.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {

  @InjectEntityManager()
  entityManager: EntityManager;

  @Inject(RedisService)
  redisService: RedisService;
  // 初始化数据
  async initData() {
    const user2 = new User();
    user2.name = '李四';

    const user3 = new User();
    user3.name = '王五';

    const user4 = new User();
    user4.name = '赵六';

    const user5 = new User();
    user5.name = '刘七';

    // await this.entityManager.save(user2);
    // await this.entityManager.save(user3);
    // await this.entityManager.save(user4);
    // await this.entityManager.save(user5);
    await this.entityManager.save([user2, user3, user4, user5]);

    const user1 = new User();
    user1.name = '张三';

    user1.followers = [user2, user3, user4];

    user1.following = [user2, user5];

    await this.entityManager.save(user1);
  }
  // 根据id批量查询用户信息
  async findUserByIds(userIds: string[] | number[]) {
    const users = await this.entityManager.find(User, {
      where: {
        id: In(userIds.map(Number))
      }
    })

    // let users = [];
    // for(let i = 0; i< userIds.length; i ++) {
    //   const user = await this.entityManager.findOne(User, {
    //     where: {
    //       id: +userIds[i]
    //     }
    //   });
    //   users.push(user);
    // }

    return users;
  }
  // 根据用户id返回关注人名单、被关注人名单和相互关注名单
  async getFollowRelationship(userId: number) {
    // 1. 查询该用户是否有关注缓存字段
    const exists = await this.redisService.exists('followers:' + userId);
    if(!exists) {
      // 2. 没有缓存字段. 先查询用户和关注、被关注用户信息
      const user = await this.entityManager.findOne(User, {
        where: {
          id: userId
        },
        relations: ['followers', 'following']
      });

      if(!user.followers.length || !user.following.length) {
        // 3. 返回接口
        return {
          followers: user.followers,
          following: user.following,
          followEachOther: []
        }
      }
      // 3. 将该用户的关注者名单存入缓存
      await this.redisService.sAdd('followers:' + userId, ...user.followers.map(item => item.id.toString()));
      // 4. 将该用户的被关注者名单存入缓存
      await this.redisService.sAdd('following:' + userId, ...user.following.map(item => item.id.toString()));
      // 5. 根据两份名单取交集存入缓存
      await this.redisService.sInterStore('follow-each-other:' + userId, 'followers:' + userId, 'following:' + userId);
      // 6. 获取相互关注着id名单
      const followEachOtherIds = await this.redisService.sMember('follow-each-other:' + userId);
      // 7. 获取相互关注者的用户名单
      const followEachOtherUsers = await this.findUserByIds(followEachOtherIds);
      // 8. 返回接口
      return {
        followers: user.followers,
        following: user.following,
        followEachOther: followEachOtherUsers
      }
    } else {
      // 2. 有缓存字段时. 查询该用户的关注者id名单
      const followerIds = await this.redisService.sMember('followers:' + userId);
      // 3. 查询用户的关注者用户名单
      const followerUsers = await this.findUserByIds(followerIds);
      // 4. 有缓存字段时. 查询该用户的被关注者id名单
      const followingIds = await this.redisService.sMember('following:' + userId);
      // 5. 查询用户的被关注者用户名单
      const followingUsers = await this.findUserByIds(followingIds);
      // 6. 有缓存字段时. 查询该用户的相互关注者id名单
      const followEachOtherIds = await this.redisService.sMember('follow-each-other:' + userId);
      // 7. 查询该用户的相互关注者用户名单
      const followEachOtherUsers = await this.findUserByIds(followEachOtherIds);
      // 8. 返回接口
      return {
        followers: followerUsers,
        following: followingUsers,
        followEachOtherUsers: followEachOtherUsers
      }
    }
  }
  // 添加userId用户关注userId2的用户
  async follow(userId: number, userId2: number) {
    // 1. 查询userId用户的关注者和被关注者的信息
    const user = await this.entityManager.findOne(User, {
      where: {
        id: userId
      },
      relations: ['followers', 'following']
    });
    // 2.查询userId2用户的信息
    const user2 = await this.entityManager.findOne(User, {
      where: {
        id: userId2
      }
    });
    // 3. 添加userId用户的关注名单userId2
    user.followers.push(user2);
    // 4. 存入数据库
    await this.entityManager.save(User, user);
    // 5. 查询userId是否有redis缓存
    const exists = await this.redisService.exists('followers:' + userId);

    if(exists) {
      // 6. 有 则该用户的关注者名单添加存入缓存
      await this.redisService.sAdd('followers:' + userId, userId2.toString());
      // 7. 有 则该用户的关注者名单添加存入交集缓存
      await this.redisService.sInterStore('follow-each-other:' + userId, 'followers:' + userId, 'following' + userId);
    }
    // 8. 查询userId2是否有redis缓存
    const exists2 = await this.redisService.exists('followers:' + userId2);

    if(exists2) {
      // 9. 有 则该用户的被关注者名单添加存入缓存
      await this.redisService.sAdd('following:' + userId2, userId.toString());
      // 10. 有 则该用户的被关注者名单添加存入交集缓存
      await this.redisService.sInterStore('follow-each-other:' + userId2, 'followers:' + userId2, 'following:' + userId2);
    }
  }
}
```