import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function nestApp() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages:
        process.env.NODE_ENV === 'production' ? true : false,
    }),
  );
  app.enableCors();
  await app.listen(process.env.PORT || 4000);
}
nestApp();
