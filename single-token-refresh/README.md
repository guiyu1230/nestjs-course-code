### 单token无限刷新, 实现登录状态无感知

它也是在公司里用的非常多的一种方案。

好处就是简单，只要每次请求接口的时候返回新的 token，然后刷新下本地 token 就可以了。

我们在 axios 的 response 拦截器里可以轻松做到这个，比双 token 的无感刷新可简单太多了。

要注意的是在代码里访问其他 header，需要后端配置下 expose headers 才可以。

### 创建`login guard`登录守卫
- 在鉴权通过后生成新的token.  `response.setHeader('token', this.jwtService.sign())`
```js
// src/login.guard.ts
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoginGuard implements CanActivate {

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const authorization = request.headers.authorization;

    if(!authorization) {
      throw new UnauthorizedException('用户未登录');
    }

    try {
      const token = authorization.split(' ')[1];
      const data = this.jwtService.verify(token);
      // 在鉴权通过后生成新的token
      response.setHeader('token', this.jwtService.sign({
        username: data.username
      }, {
        expiresIn: '7d'
      }));

      return true;
    } catch(e) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}
```

### html请求
- login登录拿到token. 然后将token存入localstorage中
- 后面的接口根据localstorage的token携带到header请求
- 请求后拿到response的token. 然后覆盖到localstorage中
```js
axios.interceptors.request.use(function(config) {
  const accessToken = localStorage.getItem('access_token');

  if(accessToken) {
    config.headers.authorization = 'Bearer ' + accessToken;
  }
  return config;
})
axios.interceptors.response.use(
  (response) => {
    const newToken = response.headers['token'];
    
    if(newToken) {
      localStorage.setItem('access_token', newToken);
    }
    return response;
  }
)
async function init() {
  const res = await axios.post('http://localhost:3000/user/login', {
    username: 'guang',
    password: '123456'
  });
  console.log(res);
  localStorage.setItem('access_token', res.data);

  const res2 = await axios.get('http://localhost:3000/bbb');
  console.log(res2);
}
init();
```

### 允许跨域的接口携带自定义响应头属性
```js
const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.useStaticAssets('pages');
// 允许跨域的配置
app.enableCors({
  exposedHeaders: ['token'],
})
await app.listen(3000);
```