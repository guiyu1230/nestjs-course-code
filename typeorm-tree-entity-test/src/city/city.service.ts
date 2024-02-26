import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { City } from './entities/city.entity';

@Injectable()
export class CityService {

  @InjectEntityManager()
  entityManager: EntityManager;

  /**
   * 插入两层级数据
   */
  async inserTwo() {
    /************ 插入两层级数据 ***************/
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
  }

  /**
   * 插入三层级数据
   */
  async inserThree() {
    /************ 插入三层级数据 ***************/
    const city = new City();
    city.name = '华南';
    await this.entityManager.save(city);

    const cityChild1 = new City();
    cityChild1.name = '云南';
    const parent = await this.entityManager.findOne(City, {
      where: {
        name: '华南'
      }
    });
    if(parent) {
      cityChild1.parent = parent;
    }
    await this.entityManager.save(City, cityChild1)

    const cityChild2 = new City()
    cityChild2.name = '昆明'
    const parent2 = await this.entityManager.findOne(City, {
      where: {
        name: '云南'
      }
    });
    if(parent) {
      cityChild2.parent = parent2;
    }
    await this.entityManager.save(City, cityChild2)
  }

  /**
   * findTrees - 查到所有节点
   */
  async findAll() {
    return this.entityManager.getTreeRepository(City).findTrees();
  }

  /**
   * findRoots - 查询的是所有根节点：
   */
  async findRoots() {
    return this.entityManager.getTreeRepository(City).findRoots();
  }

  /**
   * findDescendantsTree - 是查询某个节点的所有后代节点。
   */
  async findAllByRoot() {
    const parent = await this.entityManager.findOne(City, {
      where: {
        name: '云南'
      }
    });
    return this.entityManager.getTreeRepository(City).findDescendantsTree(parent);
  }

  /**
   * findAncestorsTree 是查询某个节点的所有祖先节点。
   */
  async findAllByChild() {
    const parent = await this.entityManager.findOne(City, {
      where: {
        name: '云南'
      }
    });
    return this.entityManager.getTreeRepository(City).findAncestorsTree(parent);

    /** 这里换成 findAncestors、findDescendants 就是用扁平结构返回： */
    /** 把 findTrees 换成 find 也是会返回扁平的结构： */
    /** 还可以调用 countAncestors 和 countDescendants 来计数： */
    // return this.entityManager.getTreeRepository(City).countDescendants(parent);
  }
}
