import { Module } from '@nestjs/common';
import { FiveService } from './five.service';
import { FiveController } from './five.controller';

@Module({
  controllers: [FiveController],
  providers: [FiveService]
})
export class FiveModule {}
