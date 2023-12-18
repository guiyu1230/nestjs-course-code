这节我们实现了基于邮箱验证码的登录。

流程可以看这张图：

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ce964be279c24780b6f5e1b90ddbbbfd~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp" />

综合用到了 mysql、redis、typeorm、nodemailer 等技术。

并且使用 @nestjs/config 包的 ConfigModule 来封装配置。

要注意的是，如果用了 .env 文件，需要保证它在 src 下，并且要在 nest-cli.json 里配置 assets 和 watchAssets，不然 build 的时候不会复制到 dist 下。

这节实现的功能，前后端代码都有，算是一个不错的综合练习。

##开发流程
1. 安装`typeorm`依赖. 添加用户数据
```sh
npm install --save @nestjs/typeorm typeorm mysql2
```

2. 安装`nodemailer`包
```sh
nest g resource email

npm install --save nodemailer

npm install --save-dev @types/nodemailer
```
```js
import { Injectable } from '@nestjs/common';
import { createTransport, Transporter} from 'nodemailer';

@Injectable()
export class EmailService {

    transporter: Transporter
    
    constructor() {
        this.transporter = createTransport({
            host: "smtp.qq.com",
            port: 587,
            secure: false,
            auth: {
                user: this.configService.get('email_user'),
                pass: this.configService.get('email_password')
            },
        });
    }

    async sendMail({ to, subject, html }) {
      await this.transporter.sendMail({
        from: {
          name: '系统邮件',
          address: 'xx@xx.com'
        },
        to,
        subject,
        html
      });
    }
}

// email.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('code')
  async sendEmailCode(@Query("address") address) {
    await this.emailService.sendMail({
      to: address,
      subject: '登录验证码',
      html: '<p>你的登录验证码是 123456</p>'
    });
    return '发送成功';
  }
}
```

3. 安装`@nestjs/config`配置
```sh
npm install --save @nestjs/config
```
```js
// app.controller.ts
ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: 'src/.env'
})
```

修改`nest-cli.json`配置`.env`文件自动同步复制
```js
{
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": ["*.env"]
  }
}
```

4. 创建个 redis 模块：
```sh
nest g resource redis  --no-spec

npm install redis --save
```
```js
// redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {

    @Inject('REDIS_CLIENT') 
    private redisClient: RedisClientType;

    async get(key: string) {
        return await this.redisClient.get(key);
    }

    async set(key: string, value: string | number, ttl?: number) {
        await this.redisClient.set(key, value);

        if(ttl) {
            await this.redisClient.expire(key, ttl);
        }
    }
}

// email.controller.ts
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Inject()
  private redisService: RedisService;

  @Get('code')
  async sendEmailCode(@Query("address") address) {
    const code = Math.random().toString().slice(2,8);

    await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '登录验证码',
      html: `<p>你的登录验证码是 ${code}</p>`
    });
    return '发送成功';
  }
}
```

5. 登录入参校验
```sh
npm install --save class-validator class-transformer

app.useGlobalPipes(new ValidationPipe());
```
```js
// user.controller.ts
@Inject(RedisService)
private redisService: RedisService;

@Post('login')
async login(@Body() loginUserDto: LoginUserDto) {

    const { email, code } = loginUserDto;

    const codeInRedis = await this.redisService.get(`captcha_${email}`);

    if(!codeInRedis) {
      throw new UnauthorizedException('验证码已失效');
    }
    if(code !== codeInRedis) {
      throw new UnauthorizedException('验证码不正确');
    }

    const user = await this.userService.findUserByEmail(email);

    console.log(user);

    return 'success';
}

// user.service.ts
@InjectEntityManager()
private entityManager: EntityManager;

async findUserByEmail(email: string) {
    return await this.entityManager.findOneBy(User, {
      email
    });
}
```



