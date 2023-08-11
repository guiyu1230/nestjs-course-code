import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  @InjectEntityManager()
  private manage: EntityManager;

  //  user 模块引入动态模块
  @InjectRepository(User)
  private userRepository: Repository<User>

  // 不常使用
  @InjectDataSource()
  private dataSource: DataSource;

  create(createUserDto: CreateUserDto) {
    this.manage.getRepository(User).save(createUserDto);
    // this.manage.save(User, createUserDto);
  }

  findAll() {
    // return this.dataSource.getRepository(User).find();   // dataSource不常使用
    // return this.manage.find(User);
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.manage.findOne(User, {
      where: { id }
    })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    this.manage.save(User, {
      id: id,
      ...updateUserDto
    })
  }

  remove(id: number) {
    this.manage.delete(User, id);
  }
}
