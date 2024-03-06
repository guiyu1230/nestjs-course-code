## 会议室预定系统

### 1. 用户管理模块开发

#### 1.1 设计数据表`user`、`role`、`permission`和配置typeorm数据

#### 1.2 编写`/user/register`注册接口和配置接口`class-validator`校验

#### 1.3 添加`redis`服务配置和生成`redisService`全局服务

#### 1.4 添加`nodemail`和`smtp`发送邮件配置. 在`redis`服务生成code和校验

### 2. 配置抽离和登录认证鉴权

#### 2.1 配置抽离`nestjs/config`

#### 2.2 `init-data`初始化数据

```sql
INSERT INTO `permissions`(`id`, `code`, `description`) VALUES (DEFAULT, ?, ?) -- PARAMETERS: ["ccc","访问 ccc 接口"]
INSERT INTO `permissions`(`id`, `code`, `description`) VALUES (DEFAULT, ?, ?) -- PARAMETERS: ["ddd","访问 ddd 接口"]

INSERT INTO `roles`(`id`, `name`) VALUES (DEFAULT, ?) -- PARAMETERS: ["管理员"]
INSERT INTO `roles`(`id`, `name`) VALUES (DEFAULT, ?) -- PARAMETERS: ["普通用户"]
INSERT INTO `role_permissions`(`rolesId`, `permissionsId`) VALUES (?, ?), (?, ?), (?, ?) -- PARAMETERS: [1,1,1,2,2,1]

INSERT INTO `users`(`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFrozen`, `isAdmin`, `createTime`, `updateTime`) VALUES (DEFAULT, ?, ?, ?, ?, DEFAULT, ?, DEFAULT, ?, DEFAULT, DEFAULT) -- PARAMETERS: ["zhangsan","96e79218965eb72c92a549dd5a330112","张三","xxx@xx.com","13233323333",1]

SELECT `User`.`id` AS `User_id`, `User`.`isFrozen` AS `User_isFrozen`, `User`.`isAdmin` AS `User_isAdmin`, `User`.`createTime` AS `User_createTime`, `User`.`updateTime` AS `User_updateTime` FROM `users` `User` WHERE `User`.`id` = ? -- PARAMETERS: [4]

INSERT INTO `users`(`id`, `username`, `password`, `nick_name`, `email`, `headPic`, `phoneNumber`, `isFrozen`, `isAdmin`, `createTime`, `updateTime`) VALUES (DEFAULT, ?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT) -- PARAMETERS: ["lisi","e3ceb5881a0a1fdaad01296d7554868d","李四","yy@yy.com"]

SELECT `User`.`id` AS `User_id`, `User`.`isFrozen` AS `User_isFrozen`, `User`.`isAdmin` AS `User_isAdmin`, `User`.`createTime` AS `User_createTime`, `User`.`updateTime` AS `User_updateTime` FROM `users` `User` WHERE `User`.`id` = ? -- PARAMETERS: [5]

INSERT INTO `user_roles`(`usersId`, `rolesId`) VALUES (?, ?), (?, ?) -- PARAMETERS: [4,1,5,2]
```

#### 2.3 编写`/user/login`登录接口和配置接口`class-validator`校验

#### 2.4 添加`nestjs/jwt`配置和添加`access_token`和`refresh_token`配置

#### 2.5 添加`access_token`和`refresh_token`到登录接口和编写`/user/fresh`刷新接口

#### 2.6 添加`LoginGuard`做必登鉴权. 做`jwt`的`token`校验

#### 2.7 添加`PermissionGuard`做接口权限鉴权. 根据`jwt`用户信息和接口权限对比.和`LoginGuard`搭配使用

#### 2.7 添加`UserInfo`入参装饰器. 获取登录用户信息. 和`LoginGuard`搭配使用

### 3. 用户管理模块 - `interceptor`和修改信息接口

#### 3.1 添加一个修改响应内容的拦截器(`format-response`)。把响应的格式改成 `{code、message、data}`

#### 3.2 添加一个接口访问记录的拦截器(`invoke-record`). 记录用户行为日志
- 记录下访问的 ip、user agent、请求的 controller、method，接口耗时、响应内容，当前登录用户等信息。

![image](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24060e0f32204907887ede38c1aa018c~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp)

#### 3.3 添加一个 `/user/info` 接口. 实现查询用户信息的接口，用来回显数据

#### 3.3 添加一个 `/user/update_password` 接口. 实现修改用户密码


