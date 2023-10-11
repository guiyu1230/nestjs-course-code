### 动态模块的 forRoot 用于在 AppModule 里注册，一般指定为全局模块，forFeature 用于局部配置，在不同模块里 imports，而 register 用于一次性的配置。

### 比如 JwtModule.register、TypeOrmModule.ForRoot、TypeOrmModule.forFeature。

### 对动态模块不太理解的同学建议回过头去看看第 15 节。

> @nestjs/config 的简单源码：
<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/455632aacf7c484f873bf79c289fcc06~tplv-k3u1fbpfcp-jj-mark:1663:0:0:0:q75.awebp">

### 总结
---
这节我们学习了配置文件的使用方式，基于 dotenv、js-yaml 可以读取 .env 和 yaml 的配置文件。

我们可以通过 NODE_ENVIRONMENT 来切换不同路径的配置文件，实现开发、生产环境的配置切换。

Nest 提供了 @nestjs/config 包来封装，使用 ConfigModule.forRoot 可以读取 .env 配置文件，然后注入 ConfigService 来取配置。

还可以通过 ConfigModule.forFeature 来注册局部配置。

它的原理也很简单，就是通过 useFactory 动态产生 provider，然后在 forRoot、forFeature 里动态返回模块定义。

学习了 ConfigModule 之后，我们就可以把数据库连接信息、应用启动端口等抽离到配置文件了。