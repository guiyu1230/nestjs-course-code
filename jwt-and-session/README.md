我们分别在 nest 里实现了 session、jwt 两种给 http 添加状态的方式。

session 使用的是 express 的 express-session 中间件，通过 @Session 装饰器取出来传入 controller 里。

jwt 需要引入 @nestjs/jwt 包的 JwtModule，注入其中的 JwtService，然后通过 jwtService.sign 生成 token，通过 jwtService.verify 验证 token。

token 放在 authorization 的 header 里。

session 或者 jwt 都是非常常用的给 http 添加状态的方式，下节我们用这两种方式实现下登录注册功能。

session实现

```js
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(session({
    secret: 'guang',
    resave: false,
    saveUninitialized: false
  }));
  await app.listen(3000);
}
bootstrap();

// src/app.countroller.ts
@Get('sss')
sss(@Session() session) {
    console.log(session)
    session.count = session.count ? session.count + 1 : 1;
    return session.count;
}
```

jwt实现

```
npm install @nestjs/jwt
```

```js
// app.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'guang',
      signOptions: {
        expiresIn: '7d'
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// app.countroller.ts
@Get('ttt')
ttt(@Headers('authorization') authorization: string, @Res({ passthrough: true}) response: Response) {
  if(authorization) {
    try {
      const token = authorization.split(' ')[1];
      const data = this.jwtService.verify(token);

      const newToken = this.jwtService.sign({
        count: data.count + 1
      });
      response.setHeader('token', newToken);
      return data.count + 1
    } catch(e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  } else {
    const newToken = this.jwtService.sign({
      count: 1
    });

    response.setHeader('token', newToken);
    return 1;
  }
}
```