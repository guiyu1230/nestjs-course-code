## 快速入门ORM框架 Prisma

 TypeORM，它是一个传统的 ORM 框架，也就是把表映射到 entity 类，把表的关联映射成 entity 类的属性关联。

 <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a698288293c74bc09e0610f0b40f3ee7~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1662&h=632&s=56056&e=png&b=ffffff" />

 完成 entity 和表的映射之后，你只要调用 userRepository 和 postRepository 的 find、delete、save 等 api，typeorm 会自动生成对应的 sql 语句并执行。

这就是 Object Relational Mapping，也就是对象和关系型数据库的映射的含义。

 Prisma 不是这样的，它没有 entity 类的存在。

Prisma 创造了一种 DSL（Domain Specific Language，领域特定语言）。

它是把表映射成了 DSL 里的 model，然后编译这个 DSL 会生成 prismaClient 的代码，之后就可以调用它的 find、delete、create 等 api 来做 CRUD 了：

<img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/63dbcba51cca4de4b37da140ea4a5dd7~tplv-k3u1fbpfcp-jj-mark:1512:0:0:0:q75.awebp#?w=1666&h=632&s=58044&e=png&b=ffffff" />

只是把 entity 类变成了 DSL 语法里的 model，然后通过编译的方式生成 client 的代码，之后进行 CRUD。


```sh
mkdir prisma-test
cd prisma-test
npm init -y

npm install typescript ts-node @types/node --save-dev
npx tsc --init
npm install prisma --save-dev
# 创建 schema 文件和 env 文件：
npx prisma init --datasource-provider mysql
# 创建mysql schema
CREATE SCHEMA `prisma_test` DEFAULT CHARACTER SET utf8mb4;
# 执行本地sql文件和数据库表创建
npx prisma migrate dev --name aaa
# api方法调用
npx ts-node ./src/index.ts
npx ts-node ./src/index2.ts
```

- 执行`npx prisma migrate dev --name aaa`生成表
#### prisma语法
```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

- `@id` 是主键
- `@default(autoincrement())` 是指定默认值是自增的数字
- `@unique` 是添加唯一约束
- `@relation` 是指定多对一的关联关系，通过 authorId 关联 User 的 id

```sql
-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `emal` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,

    UNIQUE INDEX `User_emal_key`(`emal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `authorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
```

#### prisma API方法使用
```js
// ./src/index.ts
// 创建和查询操作
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function test1() {
    await prisma.user.create({
        data: {
            name: 'guang',
            email: '111@gaung.com'
        }
    });

    await prisma.user.create({
        data: {
            name: 'dong',
            email: '222@dong.com'
        }
    });

    const users = await prisma.user.findMany();
    console.log(users);
}

test1();

// ./src/index2.ts
// 创建操作
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query'
    },
  ],
});

async function test2() {
    const user = await prisma.user.create({
        data: {
            name: '东东东',
            email: 'dongdong@dong.com',
            posts: {
                create: [
                    {
                        title: 'aaa',
                        content: 'aaaa'
                    },
                    {
                        title: 'bbb',
                        content: 'bbbb'
                    }
                ]
            },
        },
    })
    console.log(user)
}

test2();

// ./src/index3.ts
// 修改操作
async function test3() {
    await prisma.post.update({
        where: {
            id: 2
        },
        data: {
            content: 'xxx'
        }
    })
}
test3();

// .src/index4.ts
// 删除操作
async function test4() {
    await prisma.post.delete({
        where: {
            id: 2
        }
    });
}
test4();
```