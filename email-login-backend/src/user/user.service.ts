import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  @InjectEntityManager()
  private entityManager: EntityManager;

  async findUserByEmail(email: string) {
    return await this.entityManager.findOneBy(User, {
      email
    })
  }
}
