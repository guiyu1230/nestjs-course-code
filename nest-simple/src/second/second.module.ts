import { Module, OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown } from '@nestjs/common';
import { SecondService } from './second.service';
import { SecondController } from './second.controller';

/**
 * 生命周期学习
 */
@Module({
  controllers: [SecondController],
  providers: [SecondService]
})
export class SecondModule implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy, BeforeApplicationShutdown, OnApplicationShutdown {

  onModuleInit() {
    console.log('SecondModule OnmoduleInit');
  }

  onApplicationBootstrap() {
    console.log('SecondModule OnApplicationBootstrap');
  }

  onModuleDestroy() {
    console.log('SecondModule onModuleDestroy');
  }

  beforeApplicationShutdown(signal?: string) {
    console.log('SecondModule beforeApplicationShutdown', signal);
  }

  onApplicationShutdown() {
    console.log('SecondModule onApplicationShutdown');
  }
}
