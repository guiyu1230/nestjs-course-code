import { Controller, Get, Inject, Param, ParseArrayPipe, ParseEnumPipe, ParseIntPipe, Query } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN, FourModuleOptions} from './four.module-definition';

enum Ggg {
  AAA = '111',
  BBB = '222',
  CCC = '333'
}

@Controller('four')
export class FourController {

  /**
   * app.modules动态注册
   * controller属性注入
   */
  @Inject(MODULE_OPTIONS_TOKEN)
  private options: FourModuleOptions;
  
  /**
   * 获取注入属性
   * @returns 返回属性
   */
  @Get()
  hello() {
    return this.options;
  }

  /**
   * 通过pipe管道转换入参
   * @returns {string} 返回入参
   */
  @Get('getIntPipe')
  getIntPipe(@Query('aa', ParseIntPipe) aa: string): string {
    return aa;
  }

  /**
   * 通过pipe管道转换入参
   * @returns {string} 返回入参
   */
  @Get('getArrayPipe')
  getArrayPipe(@Query('aa', new ParseArrayPipe({
    separator: '..', // 分隔符
    optional: true   // 允许非必传
  })) aa: Array<string>) {
    return aa;
  }

  @Get('/getEnum/:enum')
  getEnum(@Param('enum', new ParseEnumPipe(Ggg)) e: Ggg) {
    return e;
  }
}
