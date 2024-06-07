很多网站都支持三方登录，这样，不用每次都输入用户名密码，可以用别的账号来登录。

我们基于 passport 的 GitHub 策略实现了三方登录。

它核心就是要获取 clientID、clientSecret。

然后在 GithubStrategy 的构造函数传入这些信息，在 validate 方法里就可以拿到返回的 profile。

我们只要在用户表存一个 githubId 的字段，用 github 登录之后根据 id 查询用户信息，实现登录就好了。

这样就免去了每次登录都输入用户名密码的麻烦。

你平时用的三方登录就是这么实现的。

### 实现github passport授权登录

```sh
# 创建项目
nest new github-login

# 安装passport包
npm install --save passport @nestjs/passport

# 安装 passport-github2 的策略
npm install --save passport-github2
npm install --save-dev @types/passport-github2

# 生成一个 auth 模块：
nest g module auth
```

- 创建passport-github策略
- 要在github上拿到 `client id` 和 `secret`。
- 流程: `settings` - `Developer settings` - `New OAuth App` - `Register application`
```ts
//  auth/auth.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: 'Ov23liPsg7pxupYsMXah',
      clientSecret: 'ad3604a0147924406fcd2f597fb234a188cae1f9',
      callbackURL: 'http://localhost:3000/callback',
      scope: ['public_profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return profile;
  }
}
```

```ts
// auth.module.ts
import { Module } from '@nestjs/common';
import { GithubStrategy } from './auth.strategy';

@Module({
    providers: [GithubStrategy]
})
export class AuthModule {}
```

- 两个关键接口
- `http://localhost:3000/login` 授权登录
- `http://localhost:3000/callback` 授权成功回调
```ts
// app.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('')
export class AppController {
  constructor(private appService: AppService) {}

  @Get('login')
  @UseGuards(AuthGuard('github'))
  async login() {
  }

  @Get('callback')
  @UseGuards(AuthGuard('github'))
  async authCallback(@Req() req) {
    return req.user;
  }
}
```

1. `http://localhost:3000/login` ，会跳转 github 登录授权页面：
2. 然后点击 authorize，会回调 `http://localhost:3000/callback` 接口

这样我们拿到 id 就可以唯一标识这个用户。

可以在用户表里添加一个 githubId 的字段，第一次用 github 登录的时候，记录返回的 id、username、avater 等信息，然后打开一个页面让用户完善其他信息，比如 email、password 等，。

然后后续用 github 登录的时候，直接根据 githubId 来查询用户即可。