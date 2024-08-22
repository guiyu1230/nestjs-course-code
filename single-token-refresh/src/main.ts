import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets('pages');

  // 允许跨域的配置
  app.enableCors({
    exposedHeaders: ['token'],
  })

  await app.listen(3000);
}
bootstrap();
