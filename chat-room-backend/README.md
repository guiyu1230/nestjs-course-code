### 聊天系统

### 群聊需求图
![image](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f78413f01d2c43cf82ca2db9daf8ebd9~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=944&h=1100&s=126010&e=png&b=ffffff)

### 技术栈
![image](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0beaf880b4a4ffe8e1ef36e9270582f~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1586&h=1048&s=265463&e=png&b=ffffff)

前端部分还是 React + Antd Design，脚手架用 create-vite：

后端部分是 Nest + Prisma + Socket.io。

Prisma 是 ORM 框架，Socket.io 用来做 WebSocket 通信。

数据库是 mysql + redis，mysql 做持久化存储，redis 做缓存以及临时数据的存储。

用 minio 做 OSS 对象存储服务，存储上传的文件。

文档用 swagger 生成，部署用 docker compose + pm2。

### 数据库表关系图
![image](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1dfdb2067179481fb8ef946ce9285386~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1354&h=728&s=92122&e=png&b=fefefe)

### 1. 用户注册
```sh
nest new chat-room-backend
npm install prisma --save-dev
npx prisma init
# 初始化数据库
npx prisma migrate reset 
npx prisma migrate dev --name user
# 配置prismaService模块
nest g module prisma
nest g service prisma --no-spec
# user服务
nest g resource user
npm install --save class-validator class-transformer
# redis服务
nest g module redis
nest g service redis --no-spec
npm install --save redis
# email服务
nest g resource email --no-spec
npm install nodemailer --save
```

```sh
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id Int @id @default(autoincrement())
  username String @db.VarChar(50) @unique
  password String @db.VarChar(50)
  nickName String @db.VarChar(50)
  email String @db.VarChar(50)
  headPic String @db.VarChar(100) @default("")
  createTime DateTime @default(now())
  updateTime DateTime @updatedAt

  friends FriendShip[]  @relation("userToFriend")
  inverseFriends FriendShip[] @relation("friendToUser")
}

model FriendShip {
  user  User  @relation("userToFriend", fields: [userId], references: [id])
  userId Int

  friend User @relation("friendToUser", fields: [friendId], references: [id])
  friendId Int

  @@id([userId, friendId])
}
```

- DSL转换成SQL
```sql
-- CreateTable user用户表
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(50) NOT NULL,
    `nickName` VARCHAR(50) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `headPic` VARCHAR(100) NOT NULL DEFAULT '',
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable 
-- 用户关系表 user->user多对多关系表
CREATE TABLE `FriendShip` (
    `userId` INTEGER NOT NULL,
    `friendId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `friendId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FriendShip` ADD CONSTRAINT `FriendShip_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FriendShip` ADD CONSTRAINT `FriendShip_friendId_fkey` FOREIGN KEY (`friendId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
```

#### 注册功能实现
```js
// user.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EmailService)
  private emailService: EmailService;

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
      return await this.userService.create(registerUser);
  }

  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2,8);

    await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`
    });
    return '发送成功';
  }
}
```
#### 注册功能实现依赖服务
- `PrismaService`数据库操作服务
- `RedisService`缓存库服务
- `EmailService`邮箱服务
```js
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UserService {

  @Inject(PrismaService)
  private prismaService: PrismaService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  private logger = new Logger();

  async register(user: RegisterUserDto) {
      const captcha = await this.redisService.get(`captcha_${user.email}`);

      if(!captcha) {
          throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
      }

      if(user.captcha !== captcha) {
          throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
      }

      const foundUser = await this.prismaService.user.findUnique({
        where: {
          username: user.username
        }
      });

      if(foundUser) {
        throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
      }

      try {
        return await this.prismaService.user.create({
          data: {
            username: user.username,
            password: user.password,
            nickName: user.nickName,
            email: user.email
          },
          select: {
            id: true,
            username: true,
            nickName: true,
            email: true,
            headPic: true,
            createTime: true
          }
        });
      } catch(e) {
        this.logger.error(e, UserService);
        return null;
      }
  }
}
```

### 2. 用户登录
#### jwt包安装
```sh
npm install --save @nestjs/jwt
nest g guard auth --flat --no-spec
```

#### 登录模块开发
```ts
// user.controller.ts
@Inject(JwtService)
private jwtService: JwtService;

@Post('login')
async userLogin(@Body() loginUser: LoginUserDto) {
    const user = await this.userService.login(loginUser);

    return {
      user,
      token: this.jwtService.sign({
        userId: user.id,
        username: user.username
      }, {
        expiresIn: '7d'
      })
    };
}

// user.service.ts
async login(loginUserDto: LoginUserDto) {
  const foundUser = await this.prismaService.user.findUnique({
    where: {
      username: loginUserDto.username
    }
  });

  if(!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
  }

  if(foundUser.password !== loginUserDto.password) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
  }

  delete foundUser.password;
  return foundUser;
}
```

#### AuthGuard jwt鉴权守卫
```js
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

interface JwtUserData {
  userId: number;
  username: string;
}

declare module 'express' {
  interface Request {
    user: JwtUserData
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;
  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    
    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler()
    ]);

    if(!requireLogin) {
      return true;
    }

    const authorization = request.headers.authorization;

    if(!authorization) {
      throw new UnauthorizedException('用户未登录');
    }

    try{
      const token = authorization.split(' ')[1];
      const data = this.jwtService.verify<JwtUserData>(token);

      request.user = {
        userId: data.userId,
        username: data.username,
      }
      return true;
    } catch(e) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}

// src/custom.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const  RequireLogin = () => SetMetadata('require-login', true);

export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if(!request.user) {
        return null;
    }
    return data ? request.user[data] : request.user;
  },
)

// main.ts
{
  provide: APP_GUARD,
  useClass: AuthGuard
}

// app.controller.ts 使用
@Get('aaa')
@RequireLogin()
// @SetMetadata('require-login', true)
aaa(@UserInfo() userInfo, @UserInfo('username') username) {
    console.log(userInfo, username);
    return 'aaa';
}
```

### 3. 密码修改
- `/user/info`: 回显用户信息 
- `/user/update_password`: 修改密码
- `/user/update`: 修改用户信息
- `/user/update/captcha`: 发送验证码
- `/user/update_password/captcha`: 发送验证码

#### 开发`/user/info`接口
```ts
// /user/info
@Get('info')
@RequireLogin()
async info(@UserInfo('userId') userId: number) {
  return this.userService.findUserDetailById(userId);
}

async findUserDetailById(userId: number) {
  const user =  await this.prismaService.user.findUnique({
    where: {
        id: userId
    },
    select: {
      id: true,
      username: true,
      nickName: true,
      email: true,
      headPic: true,
      createTime: true
    }
  });
  return user;
}
```

#### 开发修改密码`user/update_password`接口
```ts
@Post('update_password')
async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
    return this.userService.updatePassword(passwordDto);
}

async updatePassword(passwordDto: UpdateUserPasswordDto) {
  const captcha = await this.redisService.get(`update_password_captcha_${passwordDto.email}`);

  if(!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
  }

  if(passwordDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
  }

  const foundUser = await this.prismaService.user.findUnique({
    where: {
        username: passwordDto.username
    }
  });

  foundUser.password = passwordDto.password;

  try {
    await this.prismaService.user.update({
      where: {
        id: foundUser.id
      },
      data: foundUser
    });
    return '密码修改成功';
  } catch(e) {
    this.logger.error(e, UserService);
    return '密码修改失败';
  }
}
```

#### 开发`user/update_password/captcha`验证码接口
```ts
//update_password/captcha

@Get('update_password/captcha')
async updatePasswordCaptcha(@Query('address') address: string) {
    if(!address) {
      throw new BadRequestException('邮箱地址不能为空');
    }
    const code = Math.random().toString().slice(2,8);

    await this.redisService.set(`update_password_captcha_${address}`, code, 10 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '更改密码验证码',
      html: `<p>你的更改密码验证码是 ${code}</p>`
    });
    return '发送成功';
}
```

#### 开发`/user/update`修改用户信息接口
```ts
@Post('update')
@RequireLogin()
async update(@UserInfo('userId') userId: number, @Body() updateUserDto: UpdateUserDto) {
  return await this.userService.update(userId, updateUserDto); 
}

async update(userId: number, updateUserDto: UpdateUserDto) {
    const captcha = await this.redisService.get(`update_user_captcha_${updateUserDto.email}`);

    if(!captcha) {
        throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if(updateUserDto.captcha !== captcha) {
        throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.prismaService.user.findUnique({
      where: {
        id: userId
      }
    });

    if(updateUserDto.nickName) {
        foundUser.nickName = updateUserDto.nickName;
    }
    if(updateUserDto.headPic) {
        foundUser.headPic = updateUserDto.headPic;
    }

    try {
      await this.prismaService.user.update({
        where: {
          id: userId
        },
        data: foundUser
      })
      return '用户信息修改成功';
    } catch(e) {
      this.logger.error(e, UserService);
      return '用户信息修改成功';
    }
}
```

#### 开发`update/captcha`修改用户信息验证码接口. 同`user/update_password/captcha`

### 4. 好友列表和发送好友申请
在 schema 里添加一个中间表 Friendship. 它是 user 和 user 的多对多。

```sh
model User {
  id  Int @id @default(autoincrement())
  username String @db.VarChar(50) @unique
  password String @db.VarChar(50)
  nickName String @db.VarChar(50)
  email String @db.VarChar(50) @unique
  headPic String @db.VarChar(100) @default("")
  createTime DateTime @default(now())
  updateTime DateTime @updatedAt

  friends Friendship[] @relation("userToFriend")
  inverseFriends Friendship[] @relation("friendToUser")
}

model Friendship {
  user      User      @relation("userToFriend", fields: [userId], references: [id])
  userId    Int

  friend    User      @relation("friendToUser", fields: [friendId], references: [id])
  friendId  Int

  @@id([userId, friendId])
}
```

```sql
-- CreateTable user用户表
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(50) NOT NULL,
    `nickName` VARCHAR(50) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `headPic` VARCHAR(100) NOT NULL DEFAULT '',
    `createTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateTime` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable 
-- 用户关系表 user->user多对多关系表
CREATE TABLE `FriendShip` (
    `userId` INTEGER NOT NULL,
    `friendId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `friendId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FriendShip` ADD CONSTRAINT `FriendShip_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FriendShip` ADD CONSTRAINT `FriendShip_friendId_fkey` FOREIGN KEY (`friendId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
```

```sh
# 创建FriendShip表
npx prisma migrate dev --name friend_request
# 创建friendship模块
nest g resource friendship --no-spec
```

#### 开发好友关系表接口
- `friendship/add`: 好友请求
- `friendship/request_list`: 好友请求列表
- `friendship/agree/:id`: 同意申请
- `friendship/reject/:id`: 拒绝申请
- `friendship/remove/:id`: 删除好友

