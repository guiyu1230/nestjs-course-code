这节我们学了 RBAC（role based access control） 权限控制，它相比于 ACL （access control list）的方式，多了一层角色，给用户分配角色而不是直接分配权限。

当然，检查权限的时候还是要把角色的权限合并之后再检查是否有需要的权限的。

我们通过 jwt 实现了登录，把用户和角色信息放到 token 里返回。

添加了 LoginGuard 来做登录状态的检查。

然后添加了 PermissionGuard 来做权限的检查。

LoginGuard 里从 jwt 取出 user 信息放入 request，PermissionGuard 从数据库取出角色对应的权限，检查目标 handler 和 controller 上声明的所需权限是否满足。

LoginGuard 和 PermissionGuard 需要注入一些 provider，所以通过在 AppModule 里声明 APP_GUARD 为 token 的 provider 来注册的全局 Gard。

然后在 controller 和 handler 上添加 metadata 来声明是否需要登录，需要什么权限，之后在 Guard 里取出来做检查。

这种方案查询数据库也比较频繁，也应该加一层 redis 来做缓存。

这就是基于 RBAC 的权限控制，是用的最多的一种权限控制方案。

当然，这是 RBAC0 的方案，更复杂一点的权限模型，可能会用 RBAC1、RBAC2 等，那个就是多角色继承、用户组、角色之间互斥之类的概念，会了 RBAC0，那些也就是做一些变形的事情。

绝大多数系统，用 RBAC0 就足够了。

### 使用全局guads方法校验
- 使用`import { APP_GUARD } from '@nestjs/core';`
- 在`providers`使用全局注册guard方法全局生效
```js
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Role } from './user/entities/role.entity';
import { Permission } from './user/entities/permission.entity';
import { AaaModule } from './aaa/aaa.module';
import { BbbModule } from './bbb/bbb.module';
import { LoginGuard } from './login.guard';
import { PermissionGuard } from './permission.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'guang',
      signOptions: {
        expiresIn: '7d'
      }
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "123456",
      database: "rbac_test",
      synchronize: true,
      logging: true,
      entities: [User, Role, Permission],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
          authPlugin: 'sha256_password',
      }
    }),
    UserModule,
    AaaModule,
    BbbModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    }
  ],
})
export class AppModule {}
```

### 在controler类上面生效metaData
```js
import { RequireLogin } from 'src/custom-decorator';

@Controller('aaa')
@RequireLogin()
export class AaaController {
  // 业务controller方法
}
```

- 在guard方法里通过`this.reflector.getAllAndOverride`获取
```js
// permission.guard.ts
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  const requiredPermissions = this.reflector.getAllAndOverride('require-permission', [
    context.getClass(),
    context.getHandler()
  ])

  console.log(33333333333, requiredPermissions);
}
```

### 总结
1. 使用`typeorm`创建`user`,`role`, `permission`表
2. 创建`user`模块实现登录功能登录功能设置`jwt`信息
3. 添加`class-validator`和`class-transformor`校验接口入参
4. 配置`login guard`校验`jwt`规则. 未通过校验则报错
5. 给`login guard`在`app.module.ts`设置全局校验规则.所有接口默认校验
6. 配置`custom-decorator`配置`require-login`的`setMetaData`开关.配置`jwt`全局校验白名单
7. 添加`permission guard`校验结合暴露的`userService`的方法查询数据库用户权限信息
8. 配置`custom-decorator`配置`RequirePermission`的`setMetaData`的元数据.搭配`permission guard`校验权限
9. 添加`redis`模块. 在`permission guard`里引入`redis`的方法并缓存数据库查询的用户权限信息.
10. 用户登录拿到`jwt token`然后在设置校验的接口`bbb`里携带`token`校验权限是否正确