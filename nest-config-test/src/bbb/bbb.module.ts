import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BbbService } from './bbb.service';
import { BbbController } from './bbb.controller';

@Module({
  imports: [
    // ConfigModule.forFeautrue 来注册局部配置：
    ConfigModule.forFeature(() => {
      return {
        ddd: 222
      }
    })
  ],
  controllers: [BbbController],
  providers: [BbbService]
})
export class BbbModule {}
