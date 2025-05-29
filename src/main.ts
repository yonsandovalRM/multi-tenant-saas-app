import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongooseErrorFilter } from './common/filters/mongoose-error.filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new MongooseErrorFilter());
  await app.listen(port);
  console.log(`
    🚀 Casango API is running!
    
    📖 API Documentation: http://localhost:${port}/api
    🌐 Health Check: http://localhost:${port}/api/v1/health
    
    💡 Remember to include the 'X-TENANT-ID' header in your requests!
  `);
}
bootstrap();
