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

### 7. 会议室预定管理模块

#### 7.1 创建订单表

```js
// src/booking/entities/booking.entity.ts
import { MeetingRoom } from "src/meeting-room/entities/meeting-room.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Booking {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '会议开始时间'
  })
  startTime: Date;

  @Column({
    comment: '会议结束时间'
  })
  endTime: Date;

  @Column({
    length: 20,
    comment: '状态(申请中、审批通过、审批驳回、已解除)',
    default: '申请中'
  })
  status: string;

  @Column({
    length: 100,
    comment: '备注',
    default: ''
  })
  note: string;

  @ManyToOne(() => User)
  user: User

  @ManyToOne(() => MeetingRoom)
  room: MeetingRoom

  @CreateDateColumn({
    comment: '创建时间'
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '修改时间'
  })
  updateTime: Date;
}
```
entity文件转成sql脚本
```sql
CREATE TABLE `booking` (
  `id` int NOT NULL AUTO_INCREMENT, 
  `startTime` datetime NOT NULL COMMENT '会议开始时间', 
  `endTime` datetime NOT NULL COMMENT '会议结束时间', 
  `status` varchar(20) NOT NULL COMMENT '状态(申请中、审批通过、审批驳回、已解除)' DEFAULT '申请中', 
  `note` varchar(100) NOT NULL COMMENT '备注' DEFAULT '', 
  `createTime` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), 
  `updateTime` datetime(6) NOT NULL COMMENT '修改时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
  `userId` int NULL, 
  `roomId` int NULL COMMENT '会议室ID', 
  PRIMARY KEY (`id`)
) ENGINE=InnoDB
ALTER TABLE `booking` ADD CONSTRAINT `FK_336b3f4a235460dc93645fbf222` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
ALTER TABLE `booking` ADD CONSTRAINT `FK_769a5e375729258fd0bbfc0a456` FOREIGN KEY (`roomId`) REFERENCES `meeting_room`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
```


#### 7.2 创建初始化订单生成接口`initData`
#### 7.3 使用`repl`执行`initData`接口
```sh
npm run repl

await get(BookingService).initData()

# 调用booking/list接口
await get(BookingService).find(1, 10, 'guang', '天王', '三层', 1695945600000, 1696032000000)
```

#### 7.4 创建`booking/list`接口. 根据条件查找 分页、用户名、会议室名、会议室位置、起始时间范围、结束时间范围
```js
// 根据条件查找列表: 
async find(pageNo: number, pageSize: number, username: string, meetingRoomName: string, meetingRoomPosition: string, bookingTimeRangeStart: number, bookingTimeRangeEnd: number ) {
    const skipCount = (pageNo - 1) * pageSize;

    const [bookings, totalCount] = await this.entityManager.findAndCount(Booking, {
      where: {
        user: {
          username: Like(`%${username}%`)
        },
        room: {
          name: Like(`%${meetingRoomName}%`),
          location: Like(`%${meetingRoomPosition}%`)
        },
        startTime: Between(new Date(bookingTimeRangeStart), new Date(bookingTimeRangeEnd))
      },
      relations: {
        user: true,
        room: true,
      },
      skip: skipCount,
      take: pageSize
    });

    return {
      bookings,
      totalCount
    }
}
```

#### 7.5 添加预定会议接口`booking/add`
```js
async add(bookingDto: CreateBookingDto, userId: number) {
    const meetingRoom = await this.entityManager.findOneBy(MeetingRoom, {
      id: bookingDto.meetingRoomId
    });
    // 1. 查找会议室存不存在
    if(!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }
    // 2. 查找用户信息
    const user = await this.entityManager.findOneBy(User, {
      id: userId
    });
    // 3. 创建订单信息
    const booking = new Booking();
    booking.room = meetingRoom;
    booking.user = user;
    booking.startTime = new Date(bookingDto.startTime);
    booking.endTime = new Date(bookingDto.endTime);
    // 4. 查找该会议室是否时间段重叠
    const res = await this.entityManager.findOneBy(Booking, {
      room: {
        id: meetingRoom.id
      },
      startTime: LessThanOrEqual(booking.startTime),
      endTime: MoreThanOrEqual(booking.endTime)
    });

    if(res) {
      throw new BadRequestException('该时间段已被预定');
    }
    // 5. 保存订单信息
    await this.entityManager.save(Booking, booking);
  }
```

#### 7.6 添加审批通过接口`booking/apply/:id`
#### 7.7 添加审批驳回接口`booking/reject/:id`
#### 7.8 添加预定解除接口`booking/unbind/:id`
#### 7.9 添加催办邮件发送接口`booking/urge/:id`
```js
@Inject(RedisService)
private redisService: RedisService;

@Inject(EmailService)
private emailService: EmailService;

async urge(id: number) {
    const flag = await this.redisService.get('urge_' + id);
    // 1. 查询redis记录. 限制半小时催办一次
    if(flag) {
      return '半小时内只能催办一次，请耐心等待';
    }
    // 2. 通过redis获取管理员邮箱
    let email = await this.redisService.get('admin_email');
    // 2.1 如果redis没有. 数据库查询并同步到redis
    if(!email) { 
      const admin = await this.entityManager.findOne(User, {
        select: {
          email: true
        },
        where: {
          isAdmin: true
        }
      });

      email = admin.email

      this.redisService.set('admin_email', admin.email);
    }
    // 3. 发送催办邮箱给管理员
    this.emailService.sendMail({
      to: email,
      subject: '预定申请催办提醒',
      html: `id 为 ${id} 的预定申请正在等待审批`
    });
    // 4. 添加一条半小时时长的催办记录到redis
    this.redisService.set('urge_' + id, 1, 60 * 30);
}
```

### 8. 统计管理模块

#### 8.1 创建统计管理模块 `nest g resource statistic`

#### 8.2 添加用户使用次数统计接口`/statistic/userBookingCount`

```js
async userBookingCount(startTime: string, endTime: string) {
    const res = await this.entityManager
        .createQueryBuilder(Booking, 'b')
        .select('u.id', 'userId')
        .addSelect('u.username', 'username')
        .leftJoin(User, 'u', 'b.userId = u.id')
        .addSelect('count(1)', 'bookingCount')
        .where('b.startTime between :time1 and :time2', {
            time1: startTime, 
            time2: endTime
        })
        .addGroupBy('b.user')
        .getRawMany();
    return res;
}
```

```sql
query: SELECT `u`.`id` AS `userId`, `u`.`username` AS `username`, count(1) AS `bookingCount` FROM `booking` `b` LEFT JOIN `users` `u` ON `b`.`userId` = `u`.`id` WHERE `b`.`startTime` between ? and ? GROUP BY `b`.`userId` -- PARAMETERS: ["2024-04-01","2024-04-30"]
```

#### 8.3 使用`repl`执行`userBookingCount`
```sh
npm run repl

await get(StatisticService).userBookingCount('2024-04-01', '2024-04-24')

await get(StatisticService).meetingRoomUsedCount('2024-04-01', '2024-04-24')
```

#### 8.4 添加会议室使用次数接口`/statistic/meetingRoomUsedCount`

```js
async meetingRoomUsedCount(startTime: string, endTime: string) {
    const res = await this.entityManager
        .createQueryBuilder(Booking, 'b')
        .select('m.id', 'meetingRoomId')
        .addSelect('m.name', 'meetingRoomName')
        .leftJoin(MeetingRoom, 'm', 'b.roomId = m.id')
        .addSelect('count(1)', 'usedCount')
        .where('b.startTime between :time1 and :time2', {
            time1: startTime, 
            time2: endTime
        })
        .addGroupBy('b.roomId')
        .getRawMany();
    return res;
}
```

```sql
query: SELECT `m`.`id` AS `meetingRoomId`, `m`.`name` AS `meetingRoomName`, count(1) AS `usedCount` FROM `booking` `b` LEFT JOIN `meeting_room` `m` ON `b`.`roomId` = `m`.`id` WHERE `b`.`startTime` between ? and ? GROUP BY `b`.`roomId` -- PARAMETERS: ["2024-04-01","2024-04-30"] 
```

### 9. 用migration初始化表和数据
- 创建migration脚本
```json
{
  "typeorm": "ts-node ./node_modules/typeorm/cli",
  "migration:create": "npm run typeorm -- migration:create",
  "migration:generate": "npm run typeorm -- migration:generate -d ./src/data-source.ts",
  "migration:run": "npm run typeorm -- migration:run -d ./src/data-source.ts",
  "migration:revert": "npm run typeorm -- migration:revert -d ./src/data-source.ts"
}
```

- 创建data-source.ts文件
```js
import { DataSource } from "typeorm";
import { config } from 'dotenv';

import { Permission } from './user/entities/permission.entity';
import { Role } from './user/entities/role.entity';
import { User } from './user/entities/user.entity';
import { MeetingRoom } from "./meeting-room/entities/meeting-room.entity";
import { Booking } from "./booking/entities/booking.entity";

config({ path: 'src/.env-migration' });

console.log(process.env);

export default new DataSource({
    type: "mysql",
    host: `${process.env.mysql_server_host}`,
    port: +`${process.env.mysql_server_port}`,
    username: `${process.env.mysql_server_username}`,
    password: `${process.env.mysql_server_password}`,
    database: `${process.env.mysql_server_database}`,
    synchronize: false,
    logging: true,
    entities: [
      User, Role, Permission, MeetingRoom, Booking
    ],
    poolSize: 10,
    migrations: ['src/migrations/**.ts'],
    connectorPackage: 'mysql2',
    extra: {
        authPlugin: 'sha256_password',
    }
});
```

- 把数据表给删掉
- migration:create
- 自己来填写sql
```sh
# 根据本地entity和数据表结构差异生成generate脚本
npm run migration:generate src/migrations/init
# 根据本地migration记录和数据库migration对比执行生成sql脚本
npm run migration:run
```

- 生成migration数据
- migration:generate
```sh
# 用create生成空的generate脚本
npm run migration:create src/migrations/data
# 根据本地migration记录和数据库migration对比执行生成sql脚本
npm run migration:run
```

### 10. 创建minio上传图片
- 文件上传从基于 multer 实现，保存在项目目录下，换成了基于 minio 实现的 OSS 服务。
- 使用`minio`oss服务上传代替本地接口上传`/user/upload`
- 联动**minio-fe-upload**服务. 调用`minioClient.presignedPutObject`生成权限url
- 然后前端将文件上传到该url. 实现前端直传`minio oss`

#### 10.1 创建minio OSS服务
```sh
docker pull bitnami/minio

docker run -d --name minio \
-p 9000:9000 -p 9001:9001 \
-v /home/guiyu/minio:/bitnami/nimio/data \
-e "MINIO_ROOT_USER=guiyu" \
-e "MINIO_ROOT_PASSWORD=guiyu1234" \
-e "MINIO_SKIP_CLIENT=yes" \
-e "MINIO_SERVER_URL=http://localhost:9000"  \
bitnami/minio
```

```sh
npm install --save minio

nest g module minio

nest g controller minio --no-spec

```

```js
// minio.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Global()
@Module({
    providers: [
        {
            provide: 'MINIO_CLIENT',
            async useFactory(configService: ConfigService) {
                const client = new Minio.Client({
                    endPoint: configService.get('minio_endpoint'),
                    port: +configService.get('minio_port'),
                    useSSL: false,
                    accessKey: configService.get('minio_access_key'),
                    secretKey: configService.get('minio_secret_key')
                })
                return client;
            },
            inject: [ConfigService]
          },
    ],
    exports: ['MINIO_CLIENT']
})
export class MinioModule {}

// minio.controller.ts
import { Controller, Get, Inject, Query } from '@nestjs/common';
import * as Minio from 'minio';

@Controller('minio')
export class MinioController {

    @Inject('MINIO_CLIENT')
    private minioClient: Minio.Client;

    @Get('presignedUrl') 
    presignedPutObject(@Query('name') name: string) {
        // 生成前端直传文件到oss的带权限url
        return this.minioClient.presignedPutObject('meeting-room-booking-system', name, 3600);
    }
}
```

#### 10.2 前端上传逻辑
- 1.从服务端获取直传文件到oss的url
- 2.直传文件到oss
```js
import { InboxOutlined } from "@ant-design/icons";
import { message } from "antd";
import Dragger, { DraggerProps } from "antd/es/upload/Dragger";
import { presignedUrl } from "../../interfaces/interfaces";
import axios from "axios";

interface HeadPicUploadProps {
    value?: string;
    onChange?: Function
}

let onChange: Function;

const props: DraggerProps = {
    name: 'file',
    // action: 'http://localhost:3005/user/upload',
    action: async (file) => {
        // 1.从服务端获取直传文件到oss的url
        const res = await presignedUrl(file.name);
        return res.data.data;
    },
    async customRequest(options) {
        const { onSuccess, file, action } = options;
        // 2.直传文件到oss
        const res = await axios.put(action, file);

        onSuccess!(res.data);
    },
    onChange(info) {
        const { status } = info.file;
        if (status === 'done') {
            // onChange(info.file.response.data);
            onChange('http://localhost:9000/meeting-room-booking-system/' + info.file.name);
            message.success(`${info.file.name} 文件上传成功`);
        } else if (status === 'error') {
            message.error(`${info.file.name} 文件上传失败`);
        }
    }
};

const dragger = <Dragger {...props}>
    <p className="ant-upload-drag-icon">
        <InboxOutlined />
    </p>
    <p className="ant-upload-text">点击或拖拽文件到这个区域来上传</p>
</Dragger>

export function HeadPicUpload(props: HeadPicUploadProps) {

    onChange = props.onChange!

    return props?.value ? <div>
        <img src={props.value} alt="头像" width="100" height="100"/>
        {dragger}
    </div>: <div>
        {dragger}
    </div>
}
```

### 11. Google登录授权
#### 11.1 passport local授权
```sh
npm install --save @nestjs/passport passport

npm install --save passport-local
npm install --save-dev @types/passport-local

nest g module auth
```
本地策略
```ts
// auth/local.strategy.ts
import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Inject, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { LoginUserDto } from "src/user/dto/login-user.dto";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

  @Inject(UserService)
  private userService: UserService;

  async validate(username: string, password: string) {
    const dto = new LoginUserDto();
    dto.username = username;
    dto.password = password;

    const user = await this.userService.login(dto, false);
    return user;
  }
}

// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { UserModule } from 'src/user/user.module';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [UserModule],
  providers: [LocalStrategy, GoogleStrategy]
})
export class AuthModule {}

// src/user/user.controller.ts
@UseGuards(AuthGuard('local'))
@Post('login')
async userLogin(@UserInfo() vo: LoginUserVo) {}
```

#### 11.2 passport google授权
```sh
npm install --save passport-google-oauth20
npm install --save-dev @types/passport-google-oauth20
# user.entity.ts 添加loginType字段后
npm run migration:generate src/migrations/add-user-loginType-column
npm run migration:run
```

```ts
// google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: 'google_clientID',
      clientSecret: 'google_clientSecret',
      callbackURL: 'http://localhost:3005/user/callback/google',
      scope: ['email', 'profile'],
    });
  }

  validate (accessToken: string, refreshToken: string, profile: any) {
    const { name, emails, photos } = profile
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken
    }
    return user;
  }
}

// user.controller.ts
@Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth() {}

@Get('callback/google')
@UseGuards(AuthGuard('google'))
googleAuthRedirect(@Req() req) {
    if (!req.user) {
      return 'No user from google'
    }

    return {
      message: 'User information from google',
      user: req.user
    }
}
```

#### 11.3 添加user.entity.ts 添加 loginType 字段：
```ts
// user.entity.ts
@Column({
    type: 'int',
    comment: '登录类型, 0 用户名密码登录, 1 Google 登录, 2 Github 登录',
    default: 0
})
loginType: LoginType;

export enum LoginType {
    USERNAME_PASSWORD = 0,
    GOOGLE = 1,
    GITHUB = 2
}
```

- 执行`npm run migration:run`后
```sql
ALTER TABLE `users` ADD `loginType` int NOT NULL COMMENT '登录类型, 0 用户密码登录, 1 Google登录, 2 Github登录' DEFAULT '0'
```
- 添加google登录授权类型
```ts
// user.service.ts
async registerByGoogleInfo(email: string, nickName: string, headPic: string) {
    const newUser = new User();
    newUser.email = email;
    newUser.nickName = nickName;
    newUser.headPic = headPic;
    newUser.password = '';
    newUser.username = email + Math.random().toString().slice(2, 10);
    newUser.loginType = LoginType.GOOGLE;
    newUser.isAdmin = false;

    return this.userRepository.save(newUser);
}
```

#### 11.4 添加重定向和cookie解析
```sh
npm install --save cookie-parser

npm install --save-dev @types/cookie-parser

# app.use(cookieParser());
```
- **google授权登录策略**
- **cookie携带登录信息**
- **res重定向到首页**
```ts
@Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth() {}

@Get('callback/google')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req, @Res() res: Response) {
  if (!req.user) {
    throw new BadRequestException('google 登录失败');
  }

  const foundUser = await this.userService.findUserByEmail(req.user.email);
  // 是否已注册
  if(foundUser) {
    const vo = new LoginUserVo();
    vo.userInfo = foundUser
    vo.accessToken = this.jwtService.sign({
      userId: vo.userInfo.id,
      username: vo.userInfo.username,
      email: vo.userInfo.email,
      roles: vo.userInfo.roles,
      permissions: vo.userInfo.permissions
    }, {
      expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
    });

    vo.refreshToken = this.jwtService.sign({
      userId: vo.userInfo.id
    }, {
      expiresIn: this.configService.get('jwt_refresh_token_expres_time') || '7d'
    });
    // cookie携带登录信息
    res.cookie('userInfo', JSON.stringify(vo.userInfo));
    res.cookie('accessToken', vo.accessToken);
    res.cookie('refreshToken', vo.refreshToken);
  } else {

    const user = await this.userService.registerByGoogleInfo(
      req.user.email,
      req.user.firstName + ' ' + req.user.lastName,
      req.user.picture
    );

    const vo = new LoginUserVo();
    vo.userInfo = user

    vo.accessToken = this.jwtService.sign({
      userId: vo.userInfo.id,
      username: vo.userInfo.username,
      email: vo.userInfo.email,
      roles: vo.userInfo.roles,
      permissions: vo.userInfo.permissions
    }, {
      expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
    });
  
    vo.refreshToken = this.jwtService.sign({
      userId: vo.userInfo.id
    }, {
      expiresIn: this.configService.get('jwt_refresh_token_expres_time') || '7d'
    });
    // cookie携带登录信息
    res.cookie('userInfo', JSON.stringify(vo.userInfo));
    res.cookie('accessToken', vo.accessToken);
    res.cookie('refreshToken', vo.refreshToken);
  }
  // res重定向到首页
  res.redirect('http://localhost:3000/');
}
```

### 12. 代码优化
- Google登录策略密钥添加到`.env`文件中
-  `ConfigModule` 的 `envFilePath` 指定多个 `.env`文件
```js
// 当指定多个 .env 文件时，配置会做合并，但是相同的 key 前面的配置生效。
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [ path.join(__dirname, '.env'), path.join(__dirname, '.dev.env')]
})
```

- `docker-compose.yml`添加`minio`配置
- 使用 `@nestjs/mapped-types` 的 `PartialType、PickType、OmitType、IntersectionType` 来灵活创建 dto。
- captcha：验证码用完之后就从 `redis` 中删掉，并且前端提示验证码失效