import { AppDataSource } from "./data-source"
import { Department } from "./entity/Department"
import { Employee } from "./entity/Employee"

AppDataSource.initialize().then(async () => {

    /*************************Employee ManyToOne设置了cascade*************************************/
    // const d1 = new Department();
    // d1.name = '技术部';

    // const e1 = new Employee();
    // e1.name = '张三';
    // e1.department = d1;

    // const e2 = new Employee();
    // e2.name = '李四';
    // e2.department = d1;

    // const e3 = new Employee();
    // e3.name = '王五';
    // e3.department = d1;

    // // Employee ManyToOne设置了cascade. 就不用保存Department
    // // await AppDataSource.manager.save(Department, d1);
    // await AppDataSource.manager.save(Employee, [e1, e2, e3]);


    /********************Department OneToMany设置了cascade******************************************/
    // const e1 = new Employee();
    // e1.name = '张三';

    // const e2 = new Employee();
    // e2.name = '李四';

    // const e3 = new Employee();
    // e3.name = '王五';

    // const d1 = new Department();
    // d1.name = '技术部';
    // d1.employees = [e1, e2, e3];

    // //  Department OneToMany设置了cascade. 就不用保存Employee cascade
    // await AppDataSource.manager.save(Department, d1);

    /********************查询******************************************/
    // const deps = await AppDataSource.manager.find(Department);
    // console.log(deps);

    // const deps = await AppDataSource.manager.find(Department, {
    //     relations: {
    //         employees: true
    //     }
    // })
    // console.log(deps);
    // console.log(deps.map(item => item.employees));  

    // 先 getRepository 再创建 query builder。
    // const es = await AppDataSource.manager
    //     .createQueryBuilder(Department, 'd')
    //     .leftJoinAndSelect('d.employees', 'e')
    //     .getMany();

    // console.log(es);
    // console.log(es.map(item => item.employees));
    
    const deps = await AppDataSource.manager.find(Department, {
        relations: {
            employees: true
        }
    })
    await AppDataSource.manager.delete(Employee, deps[0].employees);
    await AppDataSource.manager.delete(Department, deps[0].id);

}).catch(error => console.log(error))
