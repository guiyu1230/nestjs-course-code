import { Controller, Get, Post, Body, Inject, Patch, Param, Delete, Query, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Post('login')
  async login(@Body() loginUser: LoginUserDto) {
    const user = await this.userService.login(loginUser);

    const access_token = this.jwtService.sign({
      userId: user.id,
      username: user.username
    }, {
      secret: 'jwt_access_secret',
      expiresIn: '30m'
    })

    const refresh_token = this.jwtService.sign({
      userId: user.id
    }, {
      secret: 'jwt_refresh_secret',
      expiresIn: '7d'
    });

    return {
      access_token,
      refresh_token
    }
  }

  @Get('refresh')
  async refresh(@Query('refresh_token') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken, {
        secret: 'jwt_refresh_secret'
      })

      const user = await this.userService.findUserById(data.userId);

      const access_token = this.jwtService.sign({
        userId: user.id,
        username: user.username
      }, {
        secret: 'jwt_access_secret',
        expiresIn: '30m'
      })

      const refresh_token = this.jwtService.sign({
        userId: user.id
      }, {
        secret: 'jwt_refresh_secret',
        expiresIn: '7d'
      })

      return {
        access_token,
        refresh_token
      }
    } catch(err) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @Get('init')
  async initData() {
    await this.userService.initData();
    return 'done';
  }
}
