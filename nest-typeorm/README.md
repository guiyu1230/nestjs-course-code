创建nest和typeorm项目
```
nest new nest-typeorm -p npm

nest g resource user

npm install --save @nestjs/typeorm typeorm mysql2
```

typeorm在nest内动态注册
```js
import { Module } from '@nestjs/common';
import { TypeOrmModule } from 'xxx';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

我们会了用 TypeOrm 来连接和增删改查数据库表，在 Nest 里集成只是对 TyprOrm 的 api 封装了一层。

使用方式是在根模块 TypeOrmModule.forRoot 传入数据源配置。

然后就可以在各处注入 DataSource、EntityManager 来做增删改查了。

如果想用 Repository 来简化操作，还可以在用到的模块引入 TypeOrmModule.forFeature 的动态模块，传入 Entity，会返回对应的 Repository。

这样就可以在模块内注入该 Repository 来用了。

它的原理是 TypeOrmModule.forRoot 对应的动态模块是全局的，导出了 dataSource、entityManager，所以才可以到处注入。

而 TypeOrmModule.forFeature 则会根据吧传入 Entity 对应的 Repository 导出，这样就可以在模块内注入了。

这就是 Nest 里集成 TypeOrm 的方式和实现原理。

至此，我们就可以打通从请求到数据库的流程了。