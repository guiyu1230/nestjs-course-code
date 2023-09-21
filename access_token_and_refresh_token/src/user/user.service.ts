import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  @InjectEntityManager()
  private entityManager: EntityManager;


  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async initData() {
    const user = new User();
    user.username = 'guang'
    user.password = '123456'
    await this.entityManager.save(User, [
      user
    ])
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.entityManager.findOne(User, {
      where: {
        username: loginUserDto.username
      }
    });

    if(!user) {
      throw new HttpException('用户不存在', HttpStatus.OK);
    }

    if(user.password !=  loginUserDto.password) {
      throw new HttpException('密码错误', HttpStatus.OK);
    }

    return user;
  }

  async findUserById(id: number) {
    const user = this.entityManager.findOneBy(User, {
      id: id
    })

    if(!user) {
      throw new HttpException('刷新token 失败', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
