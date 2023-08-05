import { AppDataSource } from "./data-source"
import { Article } from "./entity/Article"
import { Tag } from "./entity/Tag"

AppDataSource.initialize().then(async () => {

    // const a1 = new Article();
    // a1.title = 'aaaa';
    // a1.content = 'aaaaaaa';

    // const a2 = new Article();
    // a2.title = 'bbbb';
    // a2.content = 'bbbbbb';

    // const t1 = new Tag();
    // t1.name = 'ttt111';

    // const t2 = new Tag();
    // t2.name = 'ttt222';

    // const t3 = new Tag();
    // t3.name = 'ttt333';

    // a1.tags = [t1, t2];
    // a2.tags = [t1, t2, t3];

    // const entityManage = AppDataSource.manager;

    // await entityManage.save(t1);
    // await entityManage.save(t2);
    // await entityManage.save(t3);

    // await entityManage.save(a1);
    // await entityManage.save(a2);

    /**********************查询*****************/
    // const article = await AppDataSource.manager.find(Article, {
    //     relations: {
    //         tags: true
    //     }
    // })

    // console.log(article);
    // console.log(article.map(item => item.tags));

    /************************************************** */
    // // const article = await AppDataSource.manager
    // //     .createQueryBuilder(Article, 'a')
    // //     .leftJoinAndSelect('a.tags', 't')
    // //     .getMany();

    // const article = await AppDataSource.manager
    //     .getRepository(Article)
    //     .createQueryBuilder("a")
    //     .leftJoinAndSelect("a.tags", "t")
    //     .getMany()

    // console.log(article);
    // console.log(article.map(item => item.tags));

    /*********************修改操作***************************/
    // const article = await AppDataSource.manager.findOne(Article, {
    //     where: {
    //         id: 2
    //     },
    //     relations: {
    //         tags: true
    //     }
    // });

    // article.title = "ccccc";
    // article.tags = article.tags.filter(item => item.name.includes('111'));

    // await AppDataSource.manager.save(article);

    /**************************删除操作*************************************/
    // await AppDataSource.manager.delete(Article, 1);
    // await AppDataSource.manager.delete(Tag, 1);

    /******************查询每个标签使用了的文章********/
    const tags = await AppDataSource.manager.find(Tag, {
        relations: {
            articles: true
        }
    });
    console.log(tags);
    

}).catch(error => console.log(error))
