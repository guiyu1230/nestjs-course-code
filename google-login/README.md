我们实现了基于 google 的三方账号登录。

首先搜索对应的 passport 策略，然后生成 client id 和 client secret。

在 nest 项目里使用这个策略，添加登录和 callback 的路由。

之后基于 google 返回的信息来自动注册，如果信息不够，可以重定向到一个 url 让用户填写其余信息。

之后再次用这个 google 账号登录的话，就会自动登录。

### 实现google passport授权登录
```sh
# 创建项目
nest new google-login

# 安装passport包
npm install --save passport @nestjs/passport

# 安装 passport-google 的策略
npm install --save passport-google-oauth20
npm install --save-dev @types/passport-google-oauth20

# 生成一个 auth 模块：
nest g module auth
```

- 创建passport-google策略
- 要在google上拿到 `client id` 和 `client secret`。
```ts
// auth/google.stategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: 'xxxxxxxxxxxxx',
      clientSecret: 'yyyyyy',
      callbackURL: 'http://localhost:3000/callback/google',
      scope: ['email', 'profile'],
    });
  }

  validate (accessToken: string, refreshToken: string, profile: any) {
    const { name, emails, photos } = profile
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken
    }
    return user;
  }
}
```

```ts
// auth.module.ts
import { Module } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';

@Module({
  providers: [GoogleStrategy]
})
export class AuthModule {}
```

#### 将google授权用户信息注册到本地
```sh
npm install --save @nestjs/typeorm typeorm mysql2
```

```ts
// src/user.entity.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum RegisterType {
    normal = 1,
    google = 2
}
@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 50
    })
    email: string;

    @Column({
        length: 20
    })
    password: string;

    @Column({
        comment: '昵称',
        length: 50
    })
    nickName: string;

    @Column({
        comment: '头像 url',
        length: 200
    })
    avater: string;

    @Column({
        comment: '注册类型: 1.用户名密码注册 2. google自动注册',
        default: 1
    })
    registerType: RegisterType;

    @CreateDateColumn()
    createTime: Date;

    @UpdateDateColumn()
    updateTime: Date;
}
```
- 对应生成的mysql执行脚本
```sql
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT, 
  `email` varchar(50) NOT NULL, 
  `password` varchar(20) NOT NULL, 
  `nickName` varchar(50) NOT NULL, 
  `avater` varchar(200) NOT NULL COMMENT '头像 url', 
  `registerType` int NOT NULL COMMENT '注册类型: 1.用户密码注册 2. google自动注册' DEFAULT '1', 
  `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
  PRIMARY KEY (`id`)
) ENGINE=InnoDB
```

- 将google授权用户信息注册到本地逻辑
```ts
// app.controller.ts
@Get('callback/google')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req) {
    // 查找本地有没有google登录授权的邮件账户
    const user = await this.appService.findGoogleUserByEmail(req.user.email);

    if(!user) {
      // 没有就执行注册逻辑
      const newUser = this.appService.registerByGoogleInfo(req.user);
      return newUser;
    } else {
      // 有就直接返回
      return user;
    }
}

// app.service.ts
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from './user.entity';

export interface GoogleInfo {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

@Injectable()
export class AppService {

  @InjectEntityManager()
  entityManager: EntityManager;

  async registerByGoogleInfo(info: GoogleInfo) {
    const user = new User();

    user.nickName = `${info.firstName}_${info.lastName}`;
    user.avater = info.picture;
    user.email = info.email;
    user.password = '';
    user.registerType = 2;

    return this.entityManager.save(User, user);
  }

  async findGoogleUserByEmail(email: string) {
    return this.entityManager.findOneBy(User, {
      registerType: 2,
      email
    });
  }
}
```