import { Injectable } from '@nestjs/common';

const users = [
  {
    username: 'guangguang',
    githubId: '33077436',
    email: 'yyy@163.com',
    hobbies: ['sleep', 'writting']
  }, 
  {
    username: 'dongdong',
    githubId: '33077437',
    email: 'xxx@xx.com',
    hobbies: ['swimming']
  }
]

@Injectable()
export class AppService {

  findUserByGithubId(githubId: string){
    return users.find(item => item.githubId === githubId);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
