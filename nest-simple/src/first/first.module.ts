import { Module } from '@nestjs/common';
import { FirstService } from './first.service';
import { FirstController } from './first.controller';

@Module({
  imports: [],
  controllers: [FirstController],
  providers: [FirstService]
})
export class FirstModule {}
