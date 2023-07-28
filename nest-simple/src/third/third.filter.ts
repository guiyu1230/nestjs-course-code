import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from 'express';

/**
 * 对抛出的异常做处理，返回对应的响应
 */
@Catch(HttpException)
export class ThirdFilter implements ExceptionFilter {
  
  catch(exception: HttpException, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse();
    response.status(exception.getStatus()).json({
      msg: exception.message
    });
  }
}