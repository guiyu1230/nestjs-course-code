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

#### 3.4 添加一个 `/update_password/captcha` 接口. 实现发送修改密码的邮箱验证码

#### 3.5 添加一个 `/user/update` 接口. 实现修改用户信息(头像、昵称、邮箱)

#### 3.6 添加一个 `update/captcha` 接口. 实现修改用户信息的发送验证码功能

### 4. 用户管理模块 - 自定义错误处理加规范响应格式 和 用户列表和分页查询

#### 4.1 配置`UnLoginFilter`自定义错误处理.未登录报错状态控制和规范返回数据格式
- 添加了 `Filter` 用来对错误格式做转换，改成 {code、message、data} 的格式，
```sh
nest g filter unlogin --flat
```
#### 4.2 配置`custom-exception`自定义所有`HttpException`的处理逻辑
```sh
nest g filter custom-exception --flat
```
#### 4.3 实现`user/freeze`冻结用户功能

#### 4.4 实现`user/list`分页查询用户列表

### 5. 使用`swagger`生成接口文档

### 6. 实现修改密码和修改用户信息功能以及上传头像功能
```js
// npm install @types/multer
// import { storage } from 'src/my-file-storage'
import * as multer from "multer";
import * as fs from 'fs';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      try {
        fs.mkdirSync('uploads');
      }catch(e) {}
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname
      cb(null, uniqueSuffix)
    }
});

export { storage };

// user.controller.ts
@Post('upload')
@UseInterceptors(FileInterceptor('file', {
  dest: 'uploads',
  storage,
  limits: {
    fileSize: 1024 * 1024 * 3
  },
  fileFilter(req, file, callback) {
    const extname = path.extname(file.originalname);
    if(['.png', '.jpg', '.gif'].includes(extname)) {
      callback(null, true);
    } else {
      callback(new BadRequestException('只能传图片'), false);
    }
  }
}))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log('file', file);
  return file.path;
}
```

### 5 会议室管理模块

#### 5.1 创建会议室数据表
```sql
CREATE TABLE `meeting_room` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '会议室ID', 
  `name` varchar(50) NOT NULL COMMENT '会议室名字', 
  `capacity` int NOT NULL COMMENT '会议室容量', 
  `location` varchar(50) NOT NULL COMMENT '会议室位置', 
  `equipment` varchar(50) NOT NULL COMMENT '设备' DEFAULT '', 
  `description` varchar(100) NOT NULL COMMENT '描述' DEFAULT '', 
  `isBooked` tinyint NOT NULL COMMENT '是否被预定' DEFAULT 0, 
  `createTime` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), 
  `updateTime` datetime(6) NOT NULL COMMENT '修改时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
   PRIMARY KEY (`id`)
) ENGINE=InnoDB
```

#### 5.2 添加`/meeting-room/initData`方法. 新建初始数据

#### 5.3 添加`repl`配置. 使用`get(MeetingRoomService).initData()`方法执行初始化

#### 5.4 添加`/meeting-room/list`接口,获取会议室列表功能. 支持条件、分页筛选

#### 5.5 添加`/meeting-room/create`接口,新建会议室

#### 5.6 添加`/meeting-room/update`接口,修改会议室信息
```sql
query: SELECT `MeetingRoom`.`id` AS `MeetingRoom_id`, `MeetingRoom`.`name` AS `MeetingRoom_name`, `MeetingRoom`.`capacity` AS `MeetingRoom_capacity`, `MeetingRoom`.`location` AS `MeetingRoom_location`, `MeetingRoom`.`equipment` AS `MeetingRoom_equipment`, `MeetingRoom`.`description` AS `MeetingRoom_description`, `MeetingRoom`.`isBooked` AS `MeetingRoom_isBooked`, `MeetingRoom`.`createTime` AS `MeetingRoom_createTime`, `MeetingRoom`.`updateTime` AS `MeetingRoom_updateTime` FROM `meeting_room` `MeetingRoom` WHERE ((`MeetingRoom`.`id` = ?)) LIMIT 1 -- PARAMETERS: [4]

query: UPDATE `meeting_room` SET `id` = ?, `name` = ?, `capacity` = ?, `location` = ?, `equipment` = ?, `description` = ?, `isBooked` = ?, `createTime` = ?, `updateTime` = ? WHERE `id` = ? -- PARAMETERS: [4,"海王星2",10,"四层西","白板、电视","海王星2会议室",0,"2024-03-24T23:07:56.700Z","2024-03-24T23:07:56.700Z",4]
```

#### 5.7 添加`/meeting-room/:id`接口,获取单会议室详细信息

#### 5.8 添加`/meeting-room/:id DELETE`接口,删除指定会议室

### 6. 会议室管理模块添加`swagger`接口文档







