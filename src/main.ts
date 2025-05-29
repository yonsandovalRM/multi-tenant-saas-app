import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongooseErrorFilter } from './common/filters/mongoose-error.filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // añadir header x-tenant-id
  const config = new DocumentBuilder()
    .setTitle('Casango API')
    .setDescription('The Casango API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new MongooseErrorFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
