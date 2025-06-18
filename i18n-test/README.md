## nest实现国际化

nest 用 nestjs-i18n 这个包，在 AppModule 里引入 I18nModule，指定资源包的路径，resolver（取 lang 配置的方式）。

然后就可以注入 I18nSerive，用它的 t 方法来取资源包中的文案了。

dto 的国际化需要全局启用 I18nValidationPipe 和 I18nValidationExceptionFilter，然后把 message 换成资源包的 key 就好了。

文案支持占位符，可以在资源包里写 {xxx} 然后用的时候传入 xxx 的值。

### 环境配置
```bash
nest new i18n-test
npm install --save nestjs-i18n
npm run start:dev
nest g resource user
npm install --save class-validator class-transformer
```

### i18n配置

#### 1. AppModule引入i18nModule
```js
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AcceptLanguageResolver, CookieResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    // i18Module配置
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(["lang", "l"]), // 根据query识别
        new HeaderResolver(["x-custom-lang"]), // 根据header识别
        new CookieResolver(['lang']),     // 根据cookie识别
        AcceptLanguageResolver,
      ]
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### 2. 创建翻译资源包
- 要注意的是，如果用了i18n 文件，需要保证它在 src 下
- `{name}`可配置变量。 **可在dto文件或者service文件内配置变量内容**
```json
// src/i18n/en/test.json
{
    "hello": "Hello World, {name}"
}
// src/i18n/zh/test.json
{
    "hello": "你好世界, {name}"
}
```

要注意的是，如果用了i18n 文件，需要保证它在 src 下，并且要在 nest-cli.json 里配置 assets 和 watchAssets，不然 build 的时候不会复制到 dist 下。

nest-cli.json下配置自动复制i18n文件
```json
"assets": [
  { "include": "i18n/**/*", "watchAssets": true }
]
```

#### 3. 服务内使用翻译配置
- `this.i18n.t('test.hello', { lang: I18nContext.current().lang })`
- 输出多语言内容
```js
import { Inject, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {

  @Inject()
  i18n: I18nService;

  getHello(): string {
    return this.i18n.t('test.hello', { 
      lang: I18nContext.current().lang,
      args: { // 可配置变量  对应翻译文件的 {name}
        name: 'guang'
      }
    })
  }
}
```

### i18n在DTO内配置
环境配置
```bash
nest g resource user
npm install --save class-validator class-transformer
```

在CreateUserDto配置
```js
/** main.js */ 
// import { ValidationPipe } from '@nestjs/common'
import {  I18nValidationExceptionFilter ,I18nValidationPipe } from 'nestjs-i18n';
// app.useGlobalPipes(new ValidationPipe());
// 默认dto校验改为i18n校验
app.useGlobalPipes(new I18nValidationPipe());
app.useGlobalFilters(new I18nValidationExceptionFilter({
  detailedErrors: false
}));

/** CreateUserDto.js */ 
import { IsNotEmpty, MinLength } from "class-validator";
import { i18nValidationMessage } from 'nestjs-i18n';
// i18n内的validate.json文件内的字段
export class CreateUserDto {
  @IsNotEmpty({
      message: "validate.usernameNotEmpty"
  })
  username: string;
  
  @IsNotEmpty({
      message: 'validate.passwordNotEmpty'
  })
  @MinLength(6, {
    message: i18nValidationMessage("validate.passwordNotLessThan6", {
      // 使用翻译文件的变量
      num: 88
    })
  })
  password: string;              
}
```