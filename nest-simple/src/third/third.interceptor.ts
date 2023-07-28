import { CallHandler, ExecutionContext, Injectable, Inject, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, map} from "rxjs";

/**
 * 拦截器的意思，可以在目标 Controller 方法前后加入一些逻辑
 */
@Injectable()
export class ThirdInterceptor implements NestInterceptor {

  @Inject(Reflector)
  private reflector: Reflector;

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    console.log('interceptor');
    
    console.log(this.reflector.get('third', context.getHandler()));
    return next.handle()
  }
}

export class TimeInterceptor implements NestInterceptor {

  @Inject(Reflector)
  private reflector: Reflector;

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    
    const now = Date.now();
    return next.handle().pipe(map(data => {
      return {
        code: 200,
        message: 'success',
        data
      }
    }))
  }
}