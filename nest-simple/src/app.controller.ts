import { Controller, Get, Inject, Optional, HttpCode, Header, Redirect, Render, Res, SetMetadata, UseGuards, UseFilters, HttpException, HttpStatus, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { ThirdGuard } from './third/third.guard';
import { ThirdDecorator, Third, ThirdParamDecorator } from './third/third.decorator';
import { ThirdFilter } from './third/third.filter';
import { ThirdInterceptor } from './third/third.interceptor';

// @Controller({ host: ':host.0.0.1', path: 'aaa' })
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('app_service') private readonly appService2: AppService,
    @Inject('person') private readonly person: {name: string, age: number},
    @Inject('person2') private readonly person2: {name: string, desc: string},
    @Inject('person3') private readonly person3: {name: string, desc: string},
    @Inject('person4') private readonly person4: {name: string, desc: string},
    @Inject('person5') private readonly person5: {name: string, desc: string},
    @Optional() @Inject('Guang') private  readonly guang: any // Optional可选入参配置. 如果没有创建对象不会报错
  ) {}

  // 可以通过构造器注入，也可以使用属性注入，二选一
  // @Inject(AppService)
  // private readonly appService: AppService;
  // @Inject('app_service')
  // private readonly appService2: AppService;
  // @Inject('person')
  // private readonly person: {name: string, age: number}
  // @Inject('person2')
  // private readonly person2: {name: string, desc: string}
  // @Inject('person3')
  // private readonly person3: {name: string, desc: string}
  // @Inject('person4')
  // private readonly person4: {name: string, desc: string}
  // @Inject('person5')
  // private readonly person5: {name: string, desc: string}
  // @Optional()    // Optional可选入参配置. 如果没有创建对象不会报错
  // @Inject('Guang')
  // private  readonly guang: any

  @Get()
  @HttpCode(221)
  @Header('aaa', 'bbb')
  getHello(): string {
    console.log(this.person, this.person2);
    console.log(this.person3, this.person4);
    console.log(this.person5, this.appService2);
    console.log(this.guang);
    return this.appService.getHello();
  }

  /**
   *  @desc 重定向地址
   */
  @Get('hhh')
  @Redirect('http://juejin.cn')
  getHhh() { }

  /**
   * 返回html文件
   * @returns {HTMLFormElement}
   */
  @Get('user')
  @Render('user')
  user() {
    return {
      name: 'gui',
      age: 30
    }
  }

  /**
   * 元数据和路由守卫组合-setMetaData和UseGuards
   * @returns {string} 返回字符串
   */
  @Get('getGuard')
  @SetMetadata('third', 'admin')
  @UseGuards(ThirdGuard)
  getGuard(): string {
    return this.appService.getHello();
  }


  /**
   * 组合使用guard和interceptors 路由守卫和拦截器
   * 两者都可获取metadata数据
   * @returns {string} 返回相应
   */
  @Get('getInterceptor')
  @UseGuards(ThirdGuard)
  @UseInterceptors(ThirdInterceptor)
  @SetMetadata('third', ['admin'])
  getInterceptor() {
    return this.appService.getHello();
  }

  /**
   * 自定义装饰器-ThirdDecorator
   * @returns {string} 返回字符串
   */
  @Get('getDecorator')
  @ThirdDecorator('user')
  @UseGuards(ThirdGuard)
  getDecorator(): string {
    return this.appService.getHello();
  }

  /**
   * 多装饰器合成-Third
   * @returns {string} 返回字符串
   */
  @Third('getCustomDecorator', 'user')
  getCustomDecorator(): string {
    return this.appService.getHello();
  }

  /**
   * 自定义参数装饰器返回-ThirdParamDecorator
   * @param third 自定义参数装饰器返回
   * @returns {string} 返回参数装饰器
   */
  @Get('getParamDecorator')
  getParamDecorator(@ThirdParamDecorator() third): string {
    return third;
  }

  /**
   * 使用HttpException -UseFilters(ThirdFilter) 错误异常处理
   * @returns 返回500错误
   */
  @Get('throwError')
  @UseFilters(ThirdFilter)
  throwError() {
    throw new HttpException('xxxx', HttpStatus.INTERNAL_SERVER_ERROR);
    return this.appService.getHello();
  }

  // 搭配 @Controller({ host: ':host.0.0.1', path: 'aaa' })
  // @Get('getHost')
  // getHost(@HostParam('host') host) {
  //   return host;
  //   return this.appService.getHello();
  // }

  /**
   * 使用了res.响应对象. 就不能使用return
   * @param res 
   * @returns 使用response就必须res.end代替return
   */
  @Get('getResponse')
  getResponse(@Res() res: Response) {
    res.end('dddd');
    return 'dddd';
  }
}
