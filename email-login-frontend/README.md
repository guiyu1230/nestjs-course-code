这节我们实现了基于邮箱验证码的登录。

流程可以看这张图：

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ce964be279c24780b6f5e1b90ddbbbfd~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp" />

综合用到了 mysql、redis、typeorm、nodemailer 等技术。

并且使用 @nestjs/config 包的 ConfigModule 来封装配置。

要注意的是，如果用了 .env 文件，需要保证它在 src 下，并且要在 nest-cli.json 里配置 assets 和 watchAssets，不然 build 的时候不会复制到 dist 下。

这节实现的功能，前后端代码都有，算是一个不错的综合练习。
