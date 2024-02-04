扫码登录是常用的功能，掘金、知乎、b 站等各大网站都有。

流程是在 pc 选择扫码登录的方式，用 APP 扫码，在 app 上登录之后进入登录确认页面。

可以点击确认登录或者取消，如果确认登录，那 pc 网站就会自动登录该账号。

它的实现原理是这样的：

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8a7469b3869b47b386b9b894d5b947c2~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1620&h=1110&s=139485&e=png&b=fefcfc">


pc 端生成二维码，然后不断轮询二维码状态。

APP 里扫码拿到 qrcode_id，然后分别调用 scan、confirm、cancel 来修改二维码状态。

并且登录之后会把 token 带过去。

在 redis 里保存着二维码的状态和用户信息，然后这边确认之后，另一边就可以用 userInfo 生成 jwt 的 token，从而实现登录。

这就是扫码登录的实现原理。

### 二维码登录原理

1. app.controller.ts实现`code/generate`和`code/check`方法
2. `code/generate`方法生成`uid码`和跳转`h5的confirm页url`
3. `code/check`会轮询该`uid码`对应的状态('noscan' | 'scan-wait-confirm' | 'scan-confirm' | 'scan-cancel' | 'expired')
4. 创建PC端index页.访问该页面.请求`code/generate`并获取二维码. 并`code/check`轮询
5. 微信扫码二维码.跳转到`confirm`页面.并请求接口`qrcode/scan`. `uid码`状态变为`scan-wait-confirm`.
6. `confirm`页面携带用户登录信息`jwt token`. 用户点击`同意`会调用`qrcode/confirm`接口将`uid码`和`jwt token`传递给服务端.
7. app.controller.ts的接口`qrcode/confirm`收到信息.改变状态.并根据token获取`userInfo`信息.并保存到缓存里.
8. `code/check`轮询到状态变为`scan-confirm`且获得`userInfo`信息返回给PC端index页. 完成二维码登录
9. 用户点击`拒绝`. 会调用`qrcode/cancel`接口.服务端将`uid码`状态改为`scan-cancel`;

```ts
// app.controller.ts
import { BadRequestException, Controller, Get, Headers, Inject, Query, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AppService } from './app.service';
import * as qrcode from 'qrcode';
import { JwtService } from '@nestjs/jwt';

const map = new Map<string, QrCodeInfo>()

interface QrCodeInfo {
  status: 'noscan' | 'scan-wait-confirm' | 'scan-confirm' | 'scan-cancel' | 'expired',
  userInfo?: {
    userId: number;
  }
}
// noscan 未扫描
// scan-wait-confirm -已扫描，等待用户确认
// scan-confirm 已扫描，用户同意授权
// scan-cancel 已扫描，用户取消授权
// expired 已过期

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  private users = [
    {id: 1, username: 'dong', password: '111'},
    {id: 2, username: 'guang', password: '222'}
  ]

  // 登录生成jwt
  @Get('login')
  async login(@Query('username') username: string, @Query('password') password: string) {
    const user = this.users.find(item => item.username === username);

    if(!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if(user.password !== password) {
      throw new UnauthorizedException('密码错误');
    }

    return {
      token: await this.jwtService.sign({
        userId: user.id
      })
    }
  }

  // 生成uid和二维码
  @Get('qrcode/generate')
  async generate() {
    const uuid = randomUUID();
    const dataUrl = await qrcode.toDataURL(`http://192.168.145.139:3000/pages/confirm.html?id=${uuid}`);

    map.set(`qrcode_${uuid}`, {
      status: 'noscan'
    })

    return {
      qrcode_id: uuid,
      img: dataUrl 
    }
  }

  // 二维码状态轮询
  @Get('qrcode/check')
  async check(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);
    if(info.status === 'scan-confirm') {
      return {
        token: await this.jwtService.sign({
          userId: info.userInfo.userId
        }),
        ...info
      }
    }
    return info;
  }

  // 二维码已扫码状态确认
  @Get('qrcode/scan')
  async scan(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);
    if(!info) {
      throw new BadRequestException('二维码已过期');
    }
    info.status = 'scan-wait-confirm';
    return 'success';
  }

  // 二维码扫码确认登录
  @Get('qrcode/confirm')
  async confirm(@Query('id') id: string, @Headers('Authorization') auth: string) {
    let user;
    try {
      const [, token] = auth.split(' ');
      const info = await this.jwtService.verify(token);

      user = this.users.find(item => item.id === info.userId);
    } catch(e) {
      throw new UnauthorizedException('token过期, 请重新登录');
    }

    const info = map.get(`qrcode_${id}`);
    if(!info) {
      throw new UnauthorizedException('二维码已过期');
    }

    info.status = 'scan-confirm';
    info.userInfo = user;
    return 'success';
  }

  // 二维码扫码取消登录
  @Get('qrcode/cancel')
  async cancel(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);
    if(!info) {
      throw new BadRequestException('二维码已过期');
    }
    info.status = 'scan-cancel';
    return 'success';
  }
}
```
