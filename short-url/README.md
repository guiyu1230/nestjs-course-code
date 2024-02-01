我们经常用短链服务把长的 url 缩短，在短信里的链接一般都是这种。

我们用 Nest 自己实现了一个。

核心是压缩码的生成，我们分析了自增 id + base62，这样容易被人拿到其它短链，不安全。hash + base62 会有冲突的可能，所以最终用的是自己生成随机数 + base62 的方案。

当然，这个随机字符串最好是提前生成，比如用定时任务在低峰期批量生成一堆，之后直接用就好了。

短链的重定向使用 302 临时重定向，这样可以记录短链访问记录，做一些分析。

市面上的短链服务，基本都是这样实现的。

## 短链码选型使用hash + base62

base64 就是 26 个大写字母、26 个小写字母、10 个数字、2 个特殊字符，一共 64 个字符。

##### 0-63 对应转换是 [A-Za-z0-9+/]

而 base62 则是去掉了两个特殊字符，一共 62 个字符。

##### 0-62 对应转换是 [0-9A-Za-z]

做短链的话，我们用 base62 比较多。

- base62写法
```js
const base62 = require("base62/lib/ascii");
 
const res = base62.encode(123456);

console.log(res);
```

- md5写法. 有` 32 `位输出字段. 太长
```js
const crypto = require('crypto');

function md5(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}

console.log(md5('111222'))
// 00b7691d86d96aevrel25hytlgrer
```

> 用递增 id + base62 作为压缩码，可以保证唯一，但是容易被人拿到其它短码，不安全。

> 用 url 做 hash 之后取一部分然后 base62 做为压缩码，有碰撞的可能，不唯一。

> 随机生成字符串再查表检测是否重复，可以保证唯一且不连续，但是性能不好。用提前批量生成的方式可以解决。

## 2. 创建短链数据库
```sh
npm install --save @nestjs/typeorm typeorm mysql2
```
```ts
// src/entities/UniqueCode.ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UniqueCode {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 10,
        comment: '压缩码'
    })
    code: string;

    @Column({
        comment: '状态, 0 未使用、1 已使用'
    })
    status: number;
}

// src/entities/ShortLongMap.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ShortLongMap {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 10,
        comment: '压缩码'
    })
    shortUrl: string;

    @Column({
        length: 200,
        comment: '原始 url'
    })
    longUrl: string;

    @CreateDateColumn()
    createTime: Date;
}
```

- 生成短链码
```ts
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { generateRandomStr } from './utils';
import { UniqueCode } from './entities/UniqueCode';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UniqueCodeService {

  @InjectEntityManager()
  private entityManager: EntityManager;

  async generateCode() {
    let str = generateRandomStr(6);

    const uniqueCode = await this.entityManager.findOneBy(UniqueCode, {
      code: str
    })

    if(!uniqueCode) {
      const code = new UniqueCode();
      code.code = str;
      code.status = 0;

      return await this.entityManager.insert(UniqueCode, code);
    } else {
      return this.generateCode();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async batchGenerateCode() {
    for(let i = 0; i<10000; i++) {
      this.generateCode();
    }
  }
}
```
- 生成长链接
```ts
import { Inject, Injectable } from '@nestjs/common';
import { UniqueCodeService } from './unique-code.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ShortLongMap } from './entities/ShortLongMap';
import { UniqueCode } from './entities/UniqueCode';

@Injectable()
export class ShortLongMapService {

  @InjectEntityManager()
  private eneityManager: EntityManager;

  @Inject(UniqueCodeService)
  private uniqueCodeService: UniqueCodeService;

  async getLongUrl(code: string) {
    const map = await this.eneityManager.findOneBy(ShortLongMap, {
      shortUrl: code
    });
    if(!map) {
      return null;
    }
    return map.longUrl;
  }

  async generate(longUrl: string) {
    let uniqueCode = await this.eneityManager.findOneBy(UniqueCode, {
      status: 0
    })

    if(!uniqueCode) {
      uniqueCode = await this.uniqueCodeService.generateCode();
    }
    const map = new ShortLongMap();
    map.shortUrl = uniqueCode.code;
    map.longUrl = longUrl;

    await this.eneityManager.insert(ShortLongMap, map);
    await this.eneityManager.update(UniqueCode, {
      id: uniqueCode.id
    }, {
      status: 1
    });
    return uniqueCode.code;
  }
}
```

- 调用短链绑定生成服务和短链跳转

使用` @Redirect() `和 `return { url: longUrl, stausCode: 302 }`生成302临时跳转

```ts
import { BadRequestException, Controller, Get, Inject, Param, Query, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { ShortLongMapService } from './short-long-map.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(ShortLongMapService)
  private shortLongMapService: ShortLongMapService;

  // 生成和绑定短链码
  @Get('short-url')
  async generateShortUrl(@Query('url') longUrl) {
    return this.shortLongMapService.generate(longUrl);
  }

  // 根据短链码查询长链和302跳转
  @Get(':code')
  @Redirect()
  async jump(@Param('code') code) {
    const longUrl = await this.shortLongMapService.getLongUrl(code);
    if(!longUrl) {
      throw new BadRequestException('短链不存在');
    }
    return {
      url: longUrl,
      stausCode: 302
    }
  }
}
```
