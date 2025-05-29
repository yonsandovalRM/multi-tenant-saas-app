import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { MongooseErrorFilter } from './common/filters/mongoose-error.filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS (opcional, para desarrollo)
  app.enableCors({
    origin: true,
    credentials: true,
    exposedHeaders: ['x-tenant-id'],
  });

  // Configuración de Swagger con soporte para x-tenant-id
  const config = new DocumentBuilder()
    .setTitle('Casango API')
    .setDescription(
      `
      ## Casango Multi-tenant API
      
      Esta API soporta multi-tenancy a través del header **x-tenant-id**.
      
      ### Autenticación y Multi-tenancy
      - **Bearer Token**: Requerido para endpoints protegidos
      - **X-Tenant-ID**: Header obligatorio que identifica el tenant
      
      ### Uso del Header X-Tenant-ID
      Todos los endpoints requieren el header \`x-tenant-id\` para identificar el tenant:
      
      \`\`\`
      x-tenant-id: tu-tenant-id-aqui
      \`\`\`
      
      ### Ejemplo de uso
      \`\`\`bash
      curl -X GET "http://localhost:3000/api/v1/your-endpoint" \\
        -H "Authorization: Bearer your-token" \\
        -H "x-tenant-id: tenant-123"
      \`\`\`
    `,
    )
    .setVersion('0.1')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Ingresa tu token JWT',
      in: 'header',
    })
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-tenant-id',
        in: 'header',
        description: 'ID del tenant para acceso multi-tenant',
      },
      'tenant-id',
    )
    .addServer('http://localhost:3000', 'Desarrollo Local')
    .addServer('https://api.casango.com', 'Producción')
    .addTag('Authentication', 'Endpoints de autenticación')
    .addTag('Tenants', 'Gestión de tenants')
    .addTag('Users', 'Gestión de usuarios')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Casango API Documentation',
    customfavIcon: '/favicon.ico',
  });

  // Configuración global de pipes con mensajes personalizados
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          if (error.constraints) {
            return Object.values(error.constraints);
          }
          // Fallback: mostrar el nombre de la propiedad inválida si no hay constraints
          return `Validation failed for property: ${error.property}`;
        });
        return new BadRequestException(messages);
      },
    }),
  );

  // Configuración del prefijo global
  app.setGlobalPrefix('api/v1');

  // Filtros globales de error
  app.useGlobalFilters(new MongooseErrorFilter());

  // Middleware personalizado para logging de requests (opcional)
  /* app.use((req, res, next) => {
    const tenantId = req.headers['x-tenant-id'];
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Tenant: ${tenantId || 'No tenant'}`,
    );
    next();
  }); */

  // Puerto de la aplicación
  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(`
    🚀 Casango API is running!
    
    📖 API Documentation: http://localhost:${port}/api
    🌐 Health Check: http://localhost:${port}/api/v1/health
    
    💡 Remember to include the 'x-tenant-id' header in your requests!
  `);
}

bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
