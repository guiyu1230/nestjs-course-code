今天我们学了如何开发一个接口的多个版本。

Nest 内置了这个功能，同一个路由，指定不同版本号就可以调用不同的接口。

只要在 main.ts 里调用 enableVersioning 即可。

有 URI、HEADER、MEDIA_TYPE、CUSTOM 四种指定版本号的方式。

HEADER 和 MEDIA_TYPE 都是在 header 里置顶，URI 是在 url 里置顶，而 CUSTOM 是自定义版本号规则。

可以在 @Controller 通过 version 指定版本号，或者在 handler 上通过 @Version 指定版本号。

如果指定为 VERSION_NEUTRAL 则是匹配任何版本号（URI 的方式不支持这个）。

这样，当你需要开发同一个接口的多个版本的时候，就可以用这些内置的功能。

### 版本号分类有多种配置. 使用`app.enableVersioning`设置
-  搭配`@Controller的version`属性去做版本控制
- `type: VersioningType.HEADER`和`header: 'version'`通过设置http请求头`header: 2`来区分多版本接口
- `type: VersioningType.MEDIA_TYPE`和`key: 'vv='`通过设置http请求头`accept: application;vv=2`来区分多版本接口
- `type: VersioningType.URI`通过给请求`url`添加`v2前缀`来区分多版本号. 这种方式不支持 `VERSION_NEUTRAL`
- `type: VersioningType.CUSTOM`和`extractor`方法来自定义多版本接口

```js
// main.js
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const extractor = (request: Request) => {
    if(request.headers['disable-custom']) {
      return '';
    }
    return request.url.includes('guang') ? '2' : '1';
  }

  app.enableVersioning({
    // type: VersioningType.HEADER,
    // header: 'version'
    // type: VersioningType.MEDIA_TYPE,
    // key: 'vv='
    // type: VersioningType.URI
    type: VersioningType.CUSTOM,
    extractor
  })
  await app.listen(3000);
}
bootstrap();
```

- 可在一个module文件里添加多个controller文件来做区分
- controllers数组里controller越靠前生效越优先
- VERSION_NEUTRAL匹配任何版本号（URI 的方式不支持这个）。
```js
// aaa.module.js
// 可在一个module文件里添加多个controller文件来做区分
// controllers数组里controller越靠前生效越优先
import { Module } from '@nestjs/common';
import { AaaService } from './aaa.service';
import { AaaController } from './aaa.controller';
import { AaaV2Controller } from './aaa-v2.controller';

@Module({
  controllers: [ AaaV2Controller, AaaController],
  providers: [AaaService],
})
export class AaaModule {}

// aaa.controller.js
@Controller({
  path: 'aaa',
  version: VERSION_NEUTRAL
  // version: ['1', '3']
})
export class AaaController {
  constructor(private readonly aaaService: AaaService) {}

  @Get()
  findAll() {
    return this.aaaService.findAll();
  }
}

// aaa-v2.controller.js
@Controller({
  path: 'aaa',
  version: '2'  // 版本2匹配
})
export class AaaV2Controller {
  constructor(private readonly aaaService: AaaService) {}

  @Get()
  findAllV2() {
    return this.aaaService.findAll() + '222';
  }
}
```