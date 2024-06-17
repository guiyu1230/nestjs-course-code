import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from './user.entity';

export interface GoogleInfo {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

@Injectable()
export class AppService {

  @InjectEntityManager()
  entityManager: EntityManager;

  getHello(): string {
    return 'Hello World!';
  }

  async registerByGoogleInfo(info: GoogleInfo) {
    const user = new User();

    user.nickName = `${info.firstName}_${info.lastName}`;
    user.avater = info.picture;
    user.email = info.email;
    user.password = '';
    user.registerType = 2;

    return this.entityManager.save(User, user);
  }

  async findGoogleUserByEmail(email: string) {
    return this.entityManager.findOneBy(User, {
      registerType: 2,
      email
    });
  }
}
