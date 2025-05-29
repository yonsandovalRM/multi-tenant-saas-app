import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongooseErrorFilter } from './common/filters/mongoose-error.filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  //app.useGlobalFilters(new MongooseErrorFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
