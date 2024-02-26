## 创建任意多层级关系表

### 创建`city.entity.ts`
- `closure-table` 用两个表存储. 效果相同
- `materialized-path`用一个表多加一个 mpath 字段存储. 效果相同
```ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent, UpdateDateColumn } from "typeorm";

@Entity()
@Tree('closure-table')  //  closure-table | materialized-path
export class City {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    status: number;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;
    
    @Column()
    name: string;

    @TreeChildren()
    children: City[];

    @TreeParent()
    parent: City;
}
```

### `closure-table`对应生成的sql脚本
```sql
CREATE TABLE `city` (
  `id` int NOT NULL AUTO_INCREMENT, 
  `status` int NOT NULL DEFAULT '0', 
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
  `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), 
  `name` varchar(255) NOT NULL, 
  `parentId` int NULL, 
  PRIMARY KEY (`id`)
) ENGINE=InnoDB

CREATE TABLE `city_closure` (
  `id_ancestor` int NOT NULL, 
  `id_descendant` int NOT NULL, 
  INDEX `IDX_1f3ef9279932b801698831499b` (`id_ancestor`), 
  INDEX `IDX_0a1ec292fafcb6398899f7f587` (`id_descendant`), 
  PRIMARY KEY (`id_ancestor`, `id_descendant`)
) ENGINE=InnoDB

ALTER TABLE `city` ADD CONSTRAINT `FK_502f28f00e93f40de5873a2ec11` FOREIGN KEY (`parentId`) REFERENCES `city`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION

ALTER TABLE `city_closure` ADD CONSTRAINT `FK_1f3ef9279932b801698831499b3` FOREIGN KEY (`id_ancestor`) REFERENCES `city`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION

ALTER TABLE `city_closure` ADD CONSTRAINT `FK_0a1ec292fafcb6398899f7f587a` FOREIGN KEY (`id_descendant`) REFERENCES `city`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
```

### 插入`华北`节点以及`山东`子节点信息
```js
const city = new City();
city.name = '华北';
await this.entityManager.save(city);

const cityChild = new City();
cityChild.name = '山东';
const parent = await this.entityManager.findOne(City, {
  where: {
    name: '华北'
  }
});

if(parent) {
  cityChild.parent = parent;
}
await this.entityManager.save(City, cityChild);
```
```sql
query: START TRANSACTION
query: INSERT INTO `city`(`id`, `status`, `createDate`, `updateDate`, `name`, `parentId`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, DEFAULT) -- PARAMETERS: ["华北"]
query: SELECT `City`.`id` AS `City_id`, `City`.`status` AS `City_status`, `City`.`createDate` AS `City_createDate`, `City`.`updateDate` AS `City_updateDate` FROM `city` `City` WHERE `City`.`id` = ? -- PARAMETERS: [1]
query: INSERT INTO `city_closure`(`id_ancestor`, `id_descendant`) VALUES (?, ?) -- PARAMETERS: [1,1]
query: COMMIT
query: SELECT `City`.`id` AS `City_id`, `City`.`status` AS `City_status`, `City`.`createDate` AS `City_createDate`, `City`.`updateDate` AS `City_updateDate`, `City`.`name` AS `City_name`, `City`.`parentId` AS `City_parentId` FROM `city` `City` WHERE ((`City`.`name` = ?)) LIMIT 1 -- PARAMETERS: ["华北"]
query: START TRANSACTION
query: INSERT INTO `city`(`id`, `status`, `createDate`, `updateDate`, `name`, `parentId`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?) -- PARAMETERS: ["山东",1]
query: SELECT `City`.`id` AS `City_id`, `City`.`status` AS `City_status`, `City`.`createDate` AS `City_createDate`, `City`.`updateDate` AS `City_updateDate` FROM `city` `City` WHERE `City`.`id` = ? -- PARAMETERS: [2]
query: INSERT INTO `city_closure`(`id_ancestor`, `id_descendant`) VALUES (?, ?) -- PARAMETERS: [2,2]
query: INSERT INTO `city_closure` (`id_ancestor`, `id_descendant`) SELECT `id_ancestor`, ? FROM `city_closure` WHERE `id_descendant` = ? -- PARAMETERS: [2,1]
query: COMMIT
query: SELECT `treeEntity`.`id` AS `treeEntity_id`, `treeEntity`.`status` AS `treeEntity_status`, `treeEntity`.`createDate` AS `treeEntity_createDate`, `treeEntity`.`updateDate` AS `treeEntity_updateDate`, `treeEntity`.`name` AS `treeEntity_name`, `treeEntity`.`parentId` AS `treeEntity_parentId` FROM `city` `treeEntity` WHERE `treeEntity`.`parentId` IS NULL
query: SELECT `treeEntity`.`id` AS `treeEntity_id`, `treeEntity`.`status` AS `treeEntity_status`, `treeEntity`.`createDate` AS `treeEntity_createDate`, `treeEntity`.`updateDate` AS `treeEntity_updateDate`, `treeEntity`.`name` AS `treeEntity_name`, `treeEntity`.`parentId` AS `treeEntity_parentId` FROM `city` `treeEntity` INNER JOIN `city_closure` `treeClosure` ON `treeClosure`.`id_descendant` = `treeEntity`.`id` WHERE `treeClosure`.`id_ancestor` = ? -- PARAMETERS: [1]
```

### 查询云南和云南下所有的子节点信息
```js
const parent = await this.entityManager.findOne(City, {
  where: {
    name: '云南'
  }
});
return this.entityManager.getTreeRepository(City).findDescendantsTree(parent);
```

```sql
query: SELECT `City`.`id` AS `City_id`, `City`.`status` AS `City_status`, `City`.`createDate` AS `City_createDate`, `City`.`updateDate` AS `City_updateDate`, `City`.`name` AS `City_name`, `City`.`parentId` AS `City_parentId` FROM `city` `City` WHERE ((`City`.`name` = ?)) LIMIT 1 -- PARAMETERS: ["云南"]

query: SELECT `treeEntity`.`id` AS `treeEntity_id`, `treeEntity`.`status` AS `treeEntity_status`, `treeEntity`.`createDate` AS `treeEntity_createDate`, `treeEntity`.`updateDate` AS `treeEntity_updateDate`, `treeEntity`.`name` AS `treeEntity_name`, `treeEntity`.`parentId` AS `treeEntity_parentId` FROM `city` `treeEntity` INNER JOIN `city_closure` `treeClosure` ON `treeClosure`.`id_descendant` = `treeEntity`.`id` WHERE `treeClosure`.`id_ancestor` = ? -- PARAMETERS: [4]
```


### `@Tree`改成 materialized-path 重新跑：
- 现在只生成了一个表：这个表多了一个` mpath `字段。
```sql
CREATE TABLE `city` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` int NOT NULL DEFAULT '0',
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updateDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `name` varchar(255) NOT NULL,
  `mpath` varchar(255) NULL DEFAULT '',
  `parentId` int NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB

query: ALTER TABLE `city` ADD CONSTRAINT `FK_502f28f00e93f40de5873a2ec11` FOREIGN KEY (`parentId`) REFERENCES `city`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
```

### typeorm节点查询API

| API | 描述 | 备注 |
| --- | --- | --- |
| findTrees | 查询所有的树状列表 |  |
| findRoots | 查询的是所有根节点 |  |
| findDescendantsTree | 查询某个节点的所有后代节点 | 节点入参 |
| findAncestorsTree | 查询某个节点的所有祖先节点 | 节点入参 |
| findAncestors | 就是用扁平结构返回节点 | 节点入参 |
| findDescendants | 就是用扁平结构返回节点 | 节点入参 |
| countAncestors | 自己和所有祖先节点数量 | 节点入参 |
| countDescendants | 自己和所有后代节点数量 | 节点入参 |
| find | 就是用扁平结构返回节点 |返回所有节点 |

其实这些存储细节我们不用关心，不管是` closure-table` 用两个表存储也好，或者 `materialized-path` 用一个表多加一个 `mpath` 字段存储也好，都能完成同样的功能。

这节我们基于 TyepORM 实现了任意层级的关系的存储。

在 entity 上使用 @Tree 标识，然后通过 @TreeParent 和 @TreeChildren 标识存储父子节点的属性。

之后可以用 getTreeRepository 的 find、findTrees、findRoots、findAncestorsTree、findAncestors、findDescendantsTree、findDescendants、countDescendants、countAncestors 等 api 来实现各种关系的查询。

存储方式可以指定 closure-table 或者 materialized-path，这两种方式一个用单表存储，一个用两个表，但实现的效果是一样的。

以后遇到任意层级的数据的存储，就是用 Tree Entity 吧。
