### Prisma的全部命令

- `init：`创建 schema 文件
- `generate： `根据 shcema 文件生成 client 代码
-`db：`同步数据库和 schema
-`migrate：`生成数据表结构更新的 sql 文件
-`studio：`用于 CRUD 的图形化界面
-`validate：`检查 schema 文件的语法错误
-`format：`格式化 schema 文件
-`version：`版本信息

其中，prisma init、prisma migrate dev 是最常用的。

prisma db pull、prisma db push 也可以方便的用来做 schema 和数据库的同步。

```sh
# 查看全部命令
npx prisma -h

mkdir prisma-all-command
cd prisma-all-command
npm init -y
npm install -g prisma

# 初始化prisma
prisma init

# 查看db命令的功能
prisma db -h
prisma db pull
prisma db push
prisma db seed
prisma db execute
# 高频使用 执行表结构迁移
# prisma migrate
prisma migrate dev --name init
prisma migrate reset

prisma generate
prisma studio
prisma validate
prisma format
prisma version
```

#### `prisma init`
- 行 init 命令后生成了 prisma/shcema.prisma 和 .env 文件：
- `prisma init --datasource-provider mysql` 生成的就是连接 mysql 的 provider 和 url 
- `prisma init --url mysql://root:guang@localhost:3306/prisma_test`: 指定连接字符串

#### `prisma db`
- `prisma db pull`: 把数据库里的表同步到 schema 文件
- `prisma db push`: 将schema文件配置同步到数据库里.并且生成了 client 代码
- `prisma db seed`: 执行脚本插入初始数据到数据库
- `prisma db execute`: 执行 sql 脚本到数据库

#### prisma db seed 命令执行
- seed 命令是执行脚本插入初始数据到数据库。
```sh
npm install typescript ts-node @types/node --save-dev
npx tsc --init
# 所有配置添加后执行
prisma db seed
``` 
- 创建prisma/seed.ts

```js
// 1. 创建prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query'
    },
  ],
});

async function main() {
    const user = await prisma.user.create({
        data: {
            name: '东东东',
            email: 'dongdong@dong.com',
            Post: {
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

main();

// 2. 在 package.json 添加 seed 命令的配置
"prisma": {
    "seed": "npx ts-node prisma/seed.ts"
},

// 3. 执行 prisma db seed 命令
```

#### prisma db execute 执行 sql 文件
- `--file` 就是指定 sql 文件的。
- `--schema` 指定 schema 文件，主要是从中拿到数据库连接信息。

```sh
# 1.创建 prisma/test.sql 
# 2.添加 delete from Post WHERE id = 2;
# 3.执行 execute
prisma db execute --file prisma/test.sql --schema prisma/schema.prisma
```

#### migrate 执行表结构迁移

- `prisma migrate dev`: 根据 schema 的变化生成 sql 文件，并执行这个 sql，还会生成 client 代码
- 它会提示是否要 reset
- 选择是，会应用这次 mirgration，生成 sql 文件
- 并且会生成 client 代码，而且会自动执行 prisma db seed，插入初始化数据。


- `prisma migrate reset`: 会清空数据然后执行所有 migration

```sh
prisma migrate dev --name init

prisma migrate reset
```

#### prisma generate
- 用来生成 client 代码的，他并不会同步数据库：
- 根据 schema 定义，在 node_modules/@prisma/client 下生成代码，用于 CRUD。

#### prisma studio
- 方便 CRUD 数据的图形界面：

#### prisma validate
- 检查 schema 文件是否有语法错误

#### prisma format
- 格式化 prisma 文件

#### prisma version
- 展示一些版本信息