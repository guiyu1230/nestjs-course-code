之前我们都是自己实现身份认证，比如基于用户名密码的认证，基于 jwt 的认证，今天我们基于 passport 库来实现了一遍。

passport 把不同的认证逻辑封装成了不同 Strategy，每个 Stategy 都有 validate 方法来验证。

#### `每个 Strategy 都是从 request 取出一些东西，交给 validate 方法验证，validate 方法返回 user 信息，自动放到 request.user 上。`

并且 @nestjs/passport 提供了 Guard 可以直接用，如果你想扩展，继承 AuthGuard('xxx') 然后重写下 canActivate 方法就好了。

细想一下，你做各种认证的时候，是不是也在做同样的事情呢？

那既然每次都是做这些事情，那为啥不用 passport 库来简化呢？

认证策略: 不同的认证方式虽然逻辑不同，但做的事情很类似：
- 用户名密码登录就是从 request 的 body 里取出 username、password 来认证。
- jwt 是从 request 的 Authorization 的 header 取出 token 来认证。

##### 不同策略都会从 request 中取出一些东西来认证，如果认证就在 request.user 上存放认证后的 user 信息，这就是它们的共同点。

---

### passport配置流程
- 安装passport包
```sh
# passport基础库
npm install --save @nestjs/passport passport

# local策略包
npm install --save passport-local
npm install --save-dev @types/passport-local
```

- 配置`local`策略代码
```ts
// nest g module auth
// nest g service auth --no-spec

// 创建src/auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    return user;
  }
}
```

- auth鉴权服务. 写具体鉴权逻辑
```ts
// src/auth/auth.service.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {

    @Inject()
    private userService: UserService;

    async validateUser(username: string, pass: string) {
        const user = await this.userService.findOne(username);

        if(!user) {
            throw new UnauthorizedException('用户不存在');
        }
        if(user.password !== pass) {
            throw new UnauthorizedException('密码错误');
        }

        const { password, ...result } = user;
        return result;
    }
}
```

- 调用login接口使用`local`策略认证
- `@UseGuards(AuthGuard('local'))`会执行认证鉴权
- 同用户登录鉴权判断效果
```ts
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller()
export class AppController {

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request) {
    console.log(req.user);
    return req.user;
  }
}
```
等同于
```ts
async login(loginUserDto: UserLoginDto) {
  const user = await this.entityManager.findOne(User, {
    where: {
      username: loginUserDto.username
    },
    relations: {
      roles: true
    }
  })

  if(!user) {
    throw new HttpException('用户不存在', HttpStatus.ACCEPTED);
  }

  if(user.password !== loginUserDto.password) {
    throw new HttpException('密码错误', HttpStatus.ACCEPTED);
  }

  return user;
}
```

#### passport-jwt配置流程
安装依赖
```sh
# jwt包
npm install --save @nestjs/jwt

# passport-jwt策略包
npm install --save passport-jwt
npm install --save-dev @types/passport-jwt
```

- 配置`jwt`策略代码
```ts
// 创建src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'guang',
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId, username: payload.username };
  }
}
```

所有策略注册在auth模块里. 即可生效
```ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UserModule } from 'src/user/user.module';
import { JwtStragety } from './jwt.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthService, LocalStrategy, JwtStragety]
})
export class AuthModule {}
```

- 调用普通接口使用`jwt`策略认证
- `@UseGuards(AuthGuard('jwt'))`会执行认证鉴权
```ts
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller()
export class AppController {

  // username,password认证策略
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request) {
    console.log(req.user);
    return req.user;
  }

  // jwt认证策略
  @UseGuards(AuthGuard('jwt'))
  @Get("list")
  list(@Req() req: Request) {
      console.log(req.user);
      return ['111', '222', '333', '444', '555']
  }
}
```
等同于 [rbac-test项目jwt鉴权](../rbac-test/src/login.guard.ts)
```ts
// login.guard.ts
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Role } from './user/entities/role.entity';

declare module 'express' {
  interface Request {
    user: {
      username: string;
      roles: Role[]
    }
  }
}

@Injectable()
export class LoginGuard implements CanActivate {

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(Reflector)
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    // 获取全局metaData状态
    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler()
    ])

    if(!requireLogin) {
      return true;
    }

    const authorization = request.headers.authorization;

    if(!authorization) {
      throw new UnauthorizedException('用户未登录');
    }

    try {
      const token = authorization.split(' ')[1];
      const data = this.jwtService.verify(token);

      request.user = data.user;
      return true;
    } catch(e) {
      throw new UnauthorizedException('token 失效， 请重新登录');
    }
  }
}
```

#### passport-jwt设置public开关
- 创建public标记
- 继承`AuthGuard('jwt')`类. 做public标记筛选
- 等同于 [rbac-test项目jwt鉴权开关标记require-login](../rbac-test/src/login.guard.ts)
```ts
// is-public.decorator
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);


// src/auth/JwtAuthGuard.ts
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "src/is-public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}

// AppModule 里全局注册Guard. 全局生效新jwt策略
{
    provide: APP_GUARD,
    useClass: JwtAuthGuard
}

// app.controller.ts
@IsPublic()
@Get('aaa')
aaa() {
    return 'aaa';
}
```

#### `每个 Strategy 都是从 request 取出一些东西，交给 validate 方法验证，validate 方法返回 user 信息，自动放到 request.user 上。`