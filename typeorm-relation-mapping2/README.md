# Awesome Project Build with TypeORM

这节我们学了一对多关系的映射，通过 @ManyToOne 或者 @OneToMany 装饰器。

TypeORM 会自动在多的那一方添加外键，不需要通过 @JoinColumn 指定，不过你可以通过 @JoinColumn 来修改外键列的名字。

双方只能有一方 cascade，不然会无限循环。设置了 cascade 之后，只要一方保存，关联的另一方就会自动保存。

删除的话，如果设置了外键的 CASCADE 或者 SET NULL，那只删除主表（一的那一方）对应的 Entity 就好了，msyql 会做后续的关联删除或者 id 置空。

否则就要先删除所有的从表（多的那一方）对应的 Entity 再删除主表对应的 Entity。

这就是 typeorm 的一对多关系的映射和 CRUD。