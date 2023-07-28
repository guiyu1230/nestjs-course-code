import { applyDecorators, createParamDecorator, ExecutionContext, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { ThirdGuard } from './third.guard';

// 最简单自定义装饰器
export const ThirdDecorator = (...args: string[]) => SetMetadata('third', args);

// applyDecorators 多自定义装饰器合成
export const Third = (path, role) => {
  return applyDecorators(
    Get(path),
    SetMetadata('third', role),
    UseGuards(ThirdGuard)
  )
}

// 参数装饰器
export const ThirdParamDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    return 'third'
  }
);
