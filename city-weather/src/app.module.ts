import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';


@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.join(__dirname, '.env')]
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
