# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Run `npm start` command

```js
  const user = new User()
  user.id = 1;
  user.firstName = "aaa111"
  user.lastName = "bbb"
  user.age = 25
  await AppDataSource.manager.save(user)

  // 批量插入操作 
  await AppDataSource.manager.save(User, [
      { firstName: 'ccc', lastName: 'ccc', age: 21 },
      { firstName: 'ddd', lastName: 'ddd', age: 22 },
      { firstName: 'eee', lastName: 'eee', age: 23 }
  ])

  // 添加id.  批量修改
  await AppDataSource.manager.save(User, [
      { id: 2, firstName: 'ccc', lastName: 'ccc', age: 21 },
      { id: 3, firstName: 'ddd', lastName: 'ddd', age: 22 },
      { id: 4, firstName: 'eee', lastName: 'eee', age: 23 }
  ])


  // 删除和批量删除
  await AppDataSource.manager.delete(User, 1);
  await AppDataSource.manager.delete(User, [2, 3])


  // 传入entiry对象 使用remove删除
  const user = new User();
  user.id = 4;
  await AppDataSource.manager.remove(User, user);

  // 使用findBy 条件查找
  const user = await AppDataSource.manager.findBy(User, {
      age: 23
  })
  console.log(user);

  // findAndCount 查找总数
  const [user, count] = await AppDataSource.manager.findAndCount(User);
  console.log(user, count);

  // findAndCountBy 条件查找
  const [user, count] = await AppDataSource.manager.findAndCountBy(User, {
      age: 23
  })
  console.log(user, count);

  // findOne查找一条
  // findOne 只是比 find 多加了个 LIMIT 1，其余的都一样。
  const user = await AppDataSource.manager.findOne(User, {
      select: {
          firstName: true,
          age: true
      },
      where: {
          id: 9
      },
      order: {
          age: 'ASC'
      }
  });
  console.log(user);
  
  // findOneBy查找一条
  const user = await AppDataSource.manager.findOneBy(User, {
      age: 23
  })
  console.log(user);

  // findOneOrFail 或者 findOneByOrFail 使用
  try {
      const user = await AppDataSource.manager.findOneOrFail(User, {
          where: {
              id: 666
          }
      });
      console.log(user);
  }catch(e) {
      console.log(e);
      console.log('没找到该用户');
  }

  // query执行mysql语句
  const user = await AppDataSource.manager.query('select * from user where age in(?, ?)', [21, 22])
  console.log(user);

  /*************************五星推荐********************************************** */
  // 复杂的query语句 使用query builder
  const queryBuilder = await AppDataSource.manager.createQueryBuilder();
  const user = await queryBuilder.select("user")
      .from(User, "user")
      .where("user.age = :age", {age: 21})
      .getOne();
  console.log(user);
```


TypeORM 里一对一关系的映射通过 @OneToOne 装饰器来声明，维持外键列的 Entity 添加 @JoinColumn 装饰器。

如果是非外键列的 Entity，想要关联查询另一个 Entity，则需要通过第二个参数指定外键列是另一个 Entity 的哪个属性。

可以通过 @OneToOne 装饰器的 onDelete、onUpdate 参数设置级联删除和更新的方式，比如 CASCADE、SET NULL 等。

还可以设置 cascade，也就是 save 的时候会自动级联相关 Entity 的 save。

增删改分别通过 save 和 delete 方法，查询可以通过 find 也可以通过 queryBuilder，不过要 find 的时候要指定 relations 才会关联查询。
