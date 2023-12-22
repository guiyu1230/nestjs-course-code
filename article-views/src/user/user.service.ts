import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  @InjectEntityManager()
  private entityManager: EntityManager

  async login(loginUserDto: LoginUserDto) {
    const user = await this.entityManager.findOne(User, {
      where: {
        username: loginUserDto.username
      }
    });

    if(!user) {
      throw new BadRequestException('用户不存在');
    }

    if(user.password !== loginUserDto.password) {
      throw new BadRequestException('密码错误');
    }

    return user;
  }
}
