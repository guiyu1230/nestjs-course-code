import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * 路由守卫的意思，可以用于在调用某个 Controller 之前判断权限，返回 true 或者 false 来决定是否放行
 */
@Injectable()
export class ThirdGuard implements CanActivate {

  @Inject(Reflector)
  private reflector: Reflector

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    // context.getClass() 从class装饰拿取数据
    // 从setMetaData处拿到数据
    console.log(this.reflector.get('third', context.getHandler()));
    
    console.log('guard');
    
    return true;
  }
}