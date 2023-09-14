import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserLoginDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {

  @Inject(JwtService)
  private jwtService: JwtService;

  constructor(private readonly userService: UserService) {}
  
  @Get('init')
  async initData() {
    await this.userService.initData();
    return 'done';
  }

  @Post('login')
  async login(@Body() loginUser: UserLoginDto) {
    const user = await this.userService.login(loginUser);

    const token = this.jwtService.sign({
      user: {
        username: user.username,
        roles: user.roles
      }
    })
    
    return {
      token
    }
  }
}
