import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

/**
 * 中间件注册 1. 创建middleware.ts文件
 * 2. 在app.module.ts实现 NestModule 接口的 configure 方法，在里面应用 AaaMiddleware 到所有路由。
 */
@Injectable()
export class ThirdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: () => void) {
        console.log('before');
        next();
        console.log('after');
        
    }
}