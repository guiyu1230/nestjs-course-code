### Nest项目里使用Typeorm迁移

生产环境是通过 migration 来创建表、更新表结构、初始化数据的。

这节我们在 nest 项目里实现了下迁移。

大概有这几步：

创建 data-source.ts 供 migration 用
把 synchronize 关掉
用 migration:generate 生成创建表的 migration
用 migration:run 执行
用 migration:create 创建 migration，然后填入数据库导出的 sql 里的 insert into 语句
用 migration:run 执行
用 migration:generate 生成修改表的 migration
用 migration:run 执行
在生产环境下，我们就是这样创建表、更新表、初始化数据的。

#### 创建项目
```sh
nest new nest-typeorm-migration

npm install --save @nestjs/typeorm typeorm mysql2

nest g resource article
```

创建`article.entity.ts` 数据实体
```js
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 30
    })
    title: string;

    @Column({
        type: 'text'
    })
    content: string;

    @CreateDateColumn()
    createTime: Date;

    @UpdateDateColumn()
    updateTime: Date;
}
```

#### 创建migrations的`data-source.ts`文件
- 生产环境先关掉 `syncronize: false`
- 创建文件
```ts
import { DataSource } from "typeorm";
import { Article } from "./article/entities/article.entity";
import { config } from 'dotenv';

config({ path: 'src/.env' });

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
    entities: [Article],
    poolSize: 10,
    migrations: ['src/migrations/**.ts'],
    connectorPackage: 'mysql2',
    extra: {
        authPlugin: 'sha256_password',
    }
});
```
#### 添加 npm scripts脚本
```json
{
  "scripts": {
    "typeorm": "ts-node ./node_modules/typeorm/cli",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:generate": "npm run typeorm -- migration:generate -d ./src/data-source.ts",
    "migration:run": "npm run typeorm -- migration:run -d ./src/data-source.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d ./src/data-source.ts"
  }
}
```

#### `执行 migration:generate 命令：`
- **它会对比 entity 和数据表的差异，生成迁移 sql：**
```sh
npm run migration:generate src/migrations/init

npm run typeorm -- migration:generate -d ./src/data-source.ts src/migrations/init

ts-node ./node_modules/typeorm/cli migration:generate -d ./src/data-source.ts src/migrations/init
```
会生成一个`migrations/1718789514407-init.ts`文件
```ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1718789514407 implements MigrationInterface {
    name = 'Init1718789514407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`article\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(30) NOT NULL, \`content\` text NOT NULL, \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`article\``);
    }

}
```
可以看到，生成的 migration 类里包含了 create table 的 sql。

#### `执行 migration:run 命令：`
- 会执行本地的`migrations记录`
- 在mysql里`migrations 表`里记录了执行过的 migration，已经执行过的不会再执行。
```sh
npm run migration:run

npm run typeorm -- migration:run -d ./src/data-source.ts

ts-node ./node_modules/typeorm/cli migration:run -d ./src/data-source.ts
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/411940df2637468e9de3f607b620456b~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=2006&h=730&s=228776&e=png&b=191919)
```sql
CREATE TABLE `article` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(30) NOT NULL, `content` text NOT NULL, `createTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updateTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB
```

#### `执行 migration:create 命令：`
- 执行`migration:create`创建个 migration 来初始化数据：
- `migration:generate` 只会根据表结构变动生成迁移 sql，而数据的插入的 sql 需要我们自己添加。
- 严格来说数据初始化不能叫 migration，而应该叫 seed，也就是种子数据。
```sh
npm run migration:create src/migrations/data

npm run stypeorm -- migration:create src/migrations/data

ts-node ./node_modules/typeorm/cli migration:create src/migrations/data
```
- 手动来添加种子数据
```ts
// 使用migration:create创建空命令
// 再手动来添加种子数据
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("INSERT INTO `article` VALUES (1,'夏日经济“热力”十足 “点燃”文旅消费新活力','人民网北京6月17日电 （高清扬）高考结束、暑期将至，各地文旅市场持续火热，暑期出游迎来热潮。热气腾腾的“夏日经济”成为消费活力升级的缩影，展示出我国文旅产业的持续发展势头。','2024-06-18 08:56:21.306445','2024-06-18 08:56:21.306445'),(2,'科学把握全面深化改革的方法要求','科学的方法是做好一切工作的重要保证。全面深化改革是一场复杂而深刻的社会变革，必须运用科学方法才能取得成功。','2024-06-18 08:56:21.325168','2024-06-18 08:56:21.325168');")
}
```
- 对应sql脚本
```sql
INSERT INTO node_test.article
(id, title, content, createTime, updateTime)
VALUES(1, '夏日经济“热力”十足 “点燃”文旅消费新活力', '人民网北京6月17日电 （高清扬）高考结束、暑期将至，各地文旅市场持续火热，暑期出游迎来热潮。热气腾腾的“夏日经济”成为消费活力升级的缩影，展示出我国文旅产业的持续发展势头。', '2024-06-19 09:08:34.175775000', '2024-06-19 09:08:34.175775000');
INSERT INTO node_test.article
(id, title, content, createTime, updateTime)
VALUES(2, '科学把握全面深化改革的方法要求', '科学的方法是做好一切工作的重要保证。全面深化改革是一场复杂而深刻的社会变革，必须运用科学方法才能取得成功。', '2024-06-19 09:08:34.198065000', '2024-06-19 09:08:34.198065000');
```

#### `执行 migration:revert 命令：`
- 回滚上一次执行`migraion:run`命令的sql执行
- 等于在mysql表上执行`migraions`表最近一次migraion记录的`down`方法
```sh
npm run migraion:revert

npm run typeorm -- migration:revert -d ./src/data-source.ts

ts-node ./node_modules/typeorm/cli migration:revert -d ./src/data-source.ts
```

### `执行 migration:generate 命令`
- 使用`migraion:generate`执行表结构变动
```ts
// article.entity.ts
// 新增tags字段
@Column({
    length: 30
})
tags: string;
```

- 执行命令
```sh
# 生成migrations差异记录文件
npm run migration:generate src/migrations/add-tag-column

# 执行新增sql表字段添加
npm run migration:run
```

- 生成`migrations/add-tag-column.ts`记录文件
- `通过比较entity数据实体和数据库表结构对比生成sql差异执行语句`
```ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTagColumn1718850060957 implements MigrationInterface {
    name = 'AddTagColumn1718850060957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`tags\` varchar(30) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`tags\``);
    }
}
```

### migraion总结
| 执行脚本 | 执行解释 |
|-- | -- |
| migration:generate | 对比`entity`和`数据表`的差异，生成迁移migration文件 |
| migration:run  | 对比migration本地记录和`数据表migration`记录差异，执行差异migraion的up方法 |
| migration:create | 创建空migration，然后填入数据库导出的 sql 里的 insert into 语句 |
| migration:revert | 回滚`数据表migration`最近一次migration操作(执行down方法) |
