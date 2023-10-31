import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createClient } from 'redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Aaa } from './aaa.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql-container',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'aaa',
      synchronize: true,
      logging: true,
      entities: [Aaa],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256_password',
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const client = createClient({
          socket: {
            host: 'redis-container',
            port: 6379
          }
        })
        await client.connect();
        return client;
      }
    }
  ],
})
export class AppModule {}
