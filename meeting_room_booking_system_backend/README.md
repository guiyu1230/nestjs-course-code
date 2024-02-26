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


