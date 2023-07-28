import { Module } from '@nestjs/common';
import { FourController } from './four.controller';
import { ConfigurableModuleClass } from './four.module-definition'

/**
 * 动态模块生成 - Dynamic Module
 * 1. 创建four.module-definition.ts 并在module里继承和引入controller
 * 2. 在controller里创建动态变量options(MODULE_OPTIONS_TOKEN和moduleOptions)
 * 3. 在app.module的imports里只引入FourModule.register({ aaa: 1, bbb: '123' }).注入值
 * 4. 调用接口访问controller里的options属性。拿到值
 */
@Module({
    controllers: [FourController]
})
export class FourModule extends ConfigurableModuleClass {}
