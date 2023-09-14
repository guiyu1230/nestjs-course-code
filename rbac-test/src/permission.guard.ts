import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UserService } from './user/user.service';
import { Permission } from './user/entities/permission.entity';
import { RedisService } from './redis/redis.service';

@Injectable()
export class PermissionGuard implements CanActivate {

  @Inject(UserService)
  private userService: UserService;

  @Inject(Reflector)
  private reflector: Reflector;

  @Inject(RedisService)
  private redisService: RedisService;

  async canActivate(
    context: ExecutionContext,
  ):  Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if(!request.user) {
      return true;
    }

    const user = request.user;

    let permissions = await this.redisService.listGet(`user_${user.username}_permission`);

    if(!permissions || !permissions.length) {

      const roles = await this.userService.findRolesByIds(request.user.roles.map(item => item.id))

      console.log(1111111111, roles);

      permissions = roles.reduce((total, current) => {
        const names = current.permissions.map(item => item.name);
        total.push(...names);
        return total;
      }, [])

      this.redisService.listSet(`user_${user.username}_permission`, permissions, 60 * 30);
    }

    console.log(2222222222, permissions);

    const requiredPermissions = this.reflector.getAllAndOverride('require-permission', [
      context.getClass(),
      context.getHandler()
    ]) || [];

    console.log(33333333333, requiredPermissions);

    for(let i = 0; i < requiredPermissions.length; i++) {
      const curPermission = requiredPermissions[i];
      const found = permissions.find(item => item === curPermission);
      if(!found) {
        throw new UnauthorizedException('您没有访问该接口的权限');
      }
    }

    return true;
  }
}
