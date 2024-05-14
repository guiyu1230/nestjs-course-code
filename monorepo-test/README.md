微服务项目可能会有很多个项目，为了方便管理，我们会使用 monorepo 的方式。

monorepo 就是在一个 git 仓库里管理多个项目。

nest cli 支持 monorepo，只要执行 nest g app xxx 就会把项目变为 monorepo 的，在 apps 下保存多个 nest 应用。

nest-cli.json 里配置了多个 projects 的信息，以及默认的 project。

npm run start:dev 或者 npm run build 可以加上应用名来编译对应的 app。

此外，多个项目可能有公共代码，这时候可以用 nest g lib xxx 创建 library。

library 保存在 libs 目录下，和 apps 一样可以有多个。

nest 会为 libs 创建别名，可以在其他 app 或者 lib 里用别名引入。

这就是 nest 里创建 monorepo 以及通过 library 复用代码的方式，用起来还是比较简单的。

### Nest 启用 monorepo
- nest默认是`tsconfig`打包. 启用`monorepo`使用`webpack`编译
```sh
# 新建项目
nest new monorepo-test
# 创建微服务app2
nest g app app2
# 创建公共代码lib1. 可被复用
nest g lib lib1

# 启动主服务monorepo-test
npm run start:dev 
# 启动微服务app2
npm run start:dev app2
# 启动公共代码lib1
npm run start:dev lib1
```

```
|- monorepo-test
  |- apps     
    |- monorepo-test   //微服务一
      |- src
      |- tsconfig.app.json // 微服务一编译配置
    |- app2            //微服务二
      |- src
      |- tsconfig.app.json // 微服务二编译配置
  |- libs                //公共代码  
    |- src
    |- tsconfig.app.json // 公共服务编译配置
  |- nest-cli.json       // nest启动服务配置
  |- tsconfig.json       // 默认编译配置
```

通过启动或者打包指令`npm run start:dev app2`. `nest`服务通过`nest-cli.json`里找到对应服务的编译选项. 从而启动对应服务的`tsconfig.json`打包编译

> nest-cli.json原配置
![nest-cli.json](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4b2b62687bf94d66a54460659ebd2e16~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1066&h=444&s=68057&e=png&b=1f1f1f)

> monorepo模式nest-cli.json配置
![nest-cli.json](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f0c226e68b5d4186a862ad6069dbb268~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1304&h=1366&s=266063&e=png&b=1f1f1f)

> tsconfig.json配置
![tsconfig.json](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65e093fd914a45c293a7702ac5c744ea~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=880&h=676&s=97366&e=png&b=1f1f1f)