有的接口除了需要登录外，还需要权限。

只有登录用户有调用该接口的权限才能正常访问。

这节我们通过 ACL （Access Control List）的方式实现了权限控制，它的特点是用户直接和权限关联。

用户和权限是多对多关系，在数据库中会存在用户表、权限表、用户权限中间表。

登录的时候，把用户信息查出来，放到 session 或者 jwt 返回。

然后访问接口的时候，在 Guard 里判断是否登录，是否有权限，没有就返回 401，有的话才会继续处理请求。

我们采用的是访问接口的时候查询权限的方案，通过 handler 上用 SetMetadata 声明的所需权限的信息，和从数据库中查出来的当前用户的权限做对比，有相应权限才会放行。

但是这种方案查询数据库太频繁，需要用 redis 来做缓存。

当然，你选择登录的时候把权限一并查出来放到 session 或者 jwt 里也是可以的。

这就是通过 ACL 实现的权限控制。

### typeorm创建

创建`user`和`permission`以及`user_permision_relation`多对多关系表

### 创建登录的接口，通过 session + cookie 的方式。

```js
// npm install express-session @types/express-session

app.use(session({
  secret: 'guang',
  resave: false,
  saveUninitialized: false
}));
```

### 添加全局校验
```js
// npm install --save class-validator class-transformer

import { IsNotEmpty, Length } from "class-validator";

export class LoginUserDto {
    @IsNotEmpty()
    @Length(1, 50)
    username: string;

    @IsNotEmpty()
    @Length(1, 50)
    password: string;
}
```

### 创建登录login.guard.ts

```js
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

declare module 'express-session' {
  interface Session {
    user: {
      username: string
    }
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    
    if(!request.session?.user){
      throw new UnauthorizedException('用户未登录');
    }

    return true;
  }
}
```

### 创建permission.guard.ts (拉取mysql或redis用户permission权限)
- `npm install redis`
- 在`user.module.ts`里局部对外导出允许其他服务调用
```js
// user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Permission } from './entities/permission.entity';

@Module({
  controllers: [UserController],
  providers: [UserService, Permission],
  exports: [UserService, Permission]
})
export class UserModule {}
```

- 局部导出后的`UserService`可以全局引入使用
- 全局到处后的`RedisService`可以全局引入使用

```js
import { RedisService } from './../redis/redis.service';
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class PermissionGuard implements CanActivate {

  @Inject(UserService) 
  private userService: UserService;

  @Inject(Reflector)
  private reflector: Reflector;

  @Inject(RedisService)
  private redisService: RedisService;

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const user = request.session.user;
    if(!user) {
      throw new UnauthorizedException('用户未登录');
    }

    // 调用redisService全局方法
    let permissions = await this.redisService.listGet(`user_${user.username}_permissions`); 

    if(permissions.length === 0) {
      // 调用this.userService 局部对外暴露服务
      const foundUser = await this.userService.findByUsername(user.username);
      permissions = foundUser.permissions.map(item => item.name);

      this.redisService.listSet(`user_${user.username}_permissions`, permissions, 60 * 30)
    }

    const permission = this.reflector.get('permission', context.getHandler());

    if(permissions.some(item => item === permission)) {
      return true;
    } else {
      throw new UnauthorizedException('没有权限访问该接口');
    }
  }
}
```