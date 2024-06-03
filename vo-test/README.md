后端系统中常见 entity、vo、dto 三种对象，vo 是用来封装返回的响应数据的。

但是 Nest 文档里并没有提到 vo 对象，因为完全可以用 entity 来代替。

entity 里加上 @Exclude 可以排除某些字段、@Expose 可以增加一些派生字段、@Transform 可以对已有字段的序列化结果做修改。

然后在 cotnroller 上加上 ClassSerializerInterceptor 的 interceptor，还可以用 @SerializeOptions 来添加 options。

它的底层是基于 class-transfomer 包来实现的，拿到响应对象，plainToClass 拿到 class，然后根据 class 的装饰器再 classToPlain 创建序列化的对象。

swagger 的 @ApiResponse 也完全可以用 entity 来代替 vo，在想排除的字段加一下 @ApiHideProperty 就好了。

Nest 文档里并没有提到 vo 对象，因为完全没有必要，可以直接用序列化的 entity。

### 后端系统常见的对象有三种：

| 名称 | 描述 |
| --- | --- |
| `Entity` | 数据实体，和数据库表对应 |
| `DTO` |  `Data Transfer Object`，用于封装请求参数 |
| `VO` | `Value Object`，用于封装返回的响应数据 |

![三者的关系](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd019321aad2433db52a5a5fe537e457~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1626&h=396&s=15066&e=webp&b=fefcfc)


#### Partial 是把 User 的属性变为可选：
```js
// user.entity.ts
export class User {
  id: number;

  username: string;

  @Exclude()
  password: string;

  email: string;

  constructor(partial: Partial<User>) {
      Object.assign(this, partial);
  }
}
```

然后在 `UserController` 的查询方法上加上 `ClassSerializerInterceptor` 实现`exclude`过滤：

```js
// user.controller.ts
@Controller('user')
@SerializeOptions({
  // strategy: 'excludeAll'
})
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

}
```

#### 复用 entity 作为 vo
- `@Exclude`作为vo可以让`password`属性过滤输出
- `@Expose` 是添加一个导出的字段，这个字段是只读的。
- `@Transform` 是对返回的字段值做一些转换。
- `@ApiProperty`代替`vo`可以作为swagger的输出描述
- `@ApiHideProperty`在swagger里把 password 字段隐藏掉
```sh
npm install --save class-transformer
```

```js
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Transform } from "class-transformer";

export class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiHideProperty()
  @Exclude()
  password: string;

  @ApiProperty()
  @Expose()
  get xxx(): string {
    return `${this.username} ${this.email}`
  }

  @ApiProperty()
  @Transform(({value}) => '邮箱是:' + value)
  email: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial)
  }
}
```