import { AppDataSource } from "./data-source"
import { User } from "./entity/User"

AppDataSource.initialize().then(async () => {

    console.log("Inserting a new user into the database...")
    // const user = new User()
    // user.id = 1;
    // user.firstName = "aaa111"
    // user.lastName = "bbb"
    // user.age = 25
    // await AppDataSource.manager.save(user)

    // 批量插入操作 
    // await AppDataSource.manager.save(User, [
    //     { firstName: 'ccc', lastName: 'ccc', age: 21 },
    //     { firstName: 'ddd', lastName: 'ddd', age: 22 },
    //     { firstName: 'eee', lastName: 'eee', age: 23 }
    // ])

    // 添加id.  批量修改
    // await AppDataSource.manager.save(User, [
    //     { id: 2, firstName: 'ccc', lastName: 'ccc', age: 21 },
    //     { id: 3, firstName: 'ddd', lastName: 'ddd', age: 22 },
    //     { id: 4, firstName: 'eee', lastName: 'eee', age: 23 }
    // ])


    // 删除和批量删除
    // await AppDataSource.manager.delete(User, 1);
    // await AppDataSource.manager.delete(User, [2, 3])


    // 传入entiry对象 使用remove删除
    // const user = new User();
    // user.id = 4;
    // await AppDataSource.manager.remove(User, user);

    // 使用findBy 条件查找
    // const user = await AppDataSource.manager.findBy(User, {
    //     age: 23
    // })
    // console.log(user);

    // findAndCount 查找总数
    // const [user, count] = await AppDataSource.manager.findAndCount(User);
    // console.log(user, count);

    // findAndCountBy 条件查找
    // const [user, count] = await AppDataSource.manager.findAndCountBy(User, {
    //     age: 23
    // })
    // console.log(user, count);

    // findOne查找一条
    // findOne 只是比 find 多加了个 LIMIT 1，其余的都一样。
    // const user = await AppDataSource.manager.findOne(User, {
    //     select: {
    //         firstName: true,
    //         age: true
    //     },
    //     where: {
    //         id: 9
    //     },
    //     order: {
    //         age: 'ASC'
    //     }
    // });
    // console.log(user);
    
    // findOneBy查找一条
    // const user = await AppDataSource.manager.findOneBy(User, {
    //     age: 23
    // })
    // console.log(user);

    // findOneOrFail 或者 findOneByOrFail 使用
    // try {
    //     const user = await AppDataSource.manager.findOneOrFail(User, {
    //         where: {
    //             id: 666
    //         }
    //     });
    //     console.log(user);
    // }catch(e) {
    //     console.log(e);
    //     console.log('没找到该用户');
    // }

    // query执行mysql语句
    // const user = await AppDataSource.manager.query('select * from user where age in(?, ?)', [21, 22])
    // console.log(user);

    /*************************五星推荐********************************************** */
    // 复杂的query语句 使用query builder
    const queryBuilder = await AppDataSource.manager.createQueryBuilder();
    const user = await queryBuilder.select("user")
        .from(User, "user")
        .where("user.age = :age", {age: 21})
        .getOne();
    console.log(user);

    // console.log("Saved a new user with id: " + user.id)

    console.log("Loading users from the database...")
    const users = await AppDataSource.manager.find(User)
    console.log("Loaded users: ", users)

    console.log("Here you can setup and run express / fastify / any other framework.")

}).catch(error => console.log(error))
